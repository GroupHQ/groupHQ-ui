// Inspired from https://github.com/rsocket/rsocket-js/blob/1.0.x-alpha/packages/rsocket-examples/src/rxjs/RxjsMessagingCompositeMetadataRouteExample.ts#L121
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Subscription, tap } from "rxjs";
import { AbstractRetryService } from "../../retry/abstractRetry.service";
import { ConfigService } from "../../../config/config.service";
import { RETRY_FOREVER } from "../../../app-tokens";
import { RsocketConnectorService } from "./rsocketConnector.service";
import { RSocket } from "rsocket-core";

@Injectable({
  providedIn: "root",
})
export class RsocketService {
  private readonly MINIMUM_DISCONNECT_RETRY_TIME: number = 5;
  private readonly MAXIMUM_DISCONNECT_RETRY_TIME: number = 10;
  private readonly _rsocketConnection$ = new BehaviorSubject<RSocket | null>(
    null,
  );
  private readonly _isConnectionReady$ = new BehaviorSubject<boolean>(false);

  private connectionSubscription: Subscription | null = null;

  constructor(
    private readonly rsocketConnectorService: RsocketConnectorService,
    configService: ConfigService,
    @Inject(RETRY_FOREVER) private readonly retryService: AbstractRetryService,
  ) {
    console.log("Retries:", this.retryService);

    if (configService) {
      this.MINIMUM_DISCONNECT_RETRY_TIME =
        configService.rsocketMinimumDisconnectRetryTime ??
        this.MINIMUM_DISCONNECT_RETRY_TIME;
      this.MAXIMUM_DISCONNECT_RETRY_TIME =
        configService.rsocketMaximumDisconnectRetryTime ??
        this.MAXIMUM_DISCONNECT_RETRY_TIME;
    }
  }

  public initializeRsocketConnection(username: string, password = "empty") {
    this.setupRsocketService(username, password);
  }

  public get isConnectionReady$() {
    return this._isConnectionReady$.asObservable();
  }

  public get isConnectionReady(): boolean {
    return this._isConnectionReady$.getValue();
  }

  public get rsocketConnection$() {
    return this._rsocketConnection$.asObservable();
  }

  public get rsocketConnection(): RSocket | null {
    return this._rsocketConnection$.getValue();
  }

  /**
   * This method is called in the service's constructor.
   * If the RSocket connection is terminated for whatever reason, it is considered
   * to be COMPLETE. In this case, the RSocket's onClose handler calls this method to restart the subscription.
   * @private
   */
  private setupRsocketService(username: string, password = "empty") {
    const connectWithRetry = () => {
      return this.retryService
        .addRetryLogic(
          this.rsocketConnectorService.connectToServer(username, password),
        )
        .pipe(
          tap((rsocket) => {
            console.log("RSocket object:", rsocket);
            this._rsocketConnection$.next(rsocket);
            this._isConnectionReady$.next(true);

            // Setup onClose handler with delay
            rsocket.onClose((error) => {
              console.log("Connection closed with error:", error);
              this._isConnectionReady$.next(false);
              this._rsocketConnection$.next(null);

              // Use setTimeout to delay reconnection attempt
              setTimeout(() => {
                console.log("Attempting to re-establish connection...");
                this.setupRsocketService(username, password);
              }, this.calculateRetryIntervalWithJitter());
            });
          }),
          catchError((error) => {
            throw new Error(
              "This error should never be reached! You should be retrying indefinitely. Error:",
              error,
            );
          }),
        );
    };

    // Initiate connection logic
    this.connectionSubscription?.unsubscribe();
    this.connectionSubscription = connectWithRetry().subscribe();
  }

  private getMinimumDisconnectRetryTimeMilliseconds() {
    return this.MINIMUM_DISCONNECT_RETRY_TIME * 1000;
  }

  private getMaximumDisconnectRetryTimeMilliseconds() {
    return this.MAXIMUM_DISCONNECT_RETRY_TIME * 1000;
  }

  private calculateRetryIntervalWithJitter(): number {
    const min = this.getMinimumDisconnectRetryTimeMilliseconds();
    const max = this.getMaximumDisconnectRetryTimeMilliseconds();
    const delay = Math.random() * (max - min) + min;
    console.log("Delay is", delay);
    return delay;
  }
}
