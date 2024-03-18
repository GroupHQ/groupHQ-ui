import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  concatWith,
  defer,
  EMPTY,
  Observable,
  of,
  Subscription,
  tap,
  throwError,
} from "rxjs";
import { RsocketConnectorService } from "./rsocketConnector.service";
import { RSocket } from "rsocket-core";
import { RetryService } from "../../retry/retry.service";
import { RSocketRequester } from "rsocket-messaging";
import { Retryable } from "../../retry/retryable";
import { v4 as uuidv4 } from "uuid";
import { RetryForeverStrategy } from "../../retry/strategies/retryForever.strategy";
import { ConfigService } from "../../../config/config.service";
import { ConnectorStatesEnum } from "./ConnectorStatesEnum";
import { RsocketRequestFactory } from "./rsocketRequest.factory";

@Injectable({
  providedIn: "root",
})
export class RsocketService implements Retryable {
  private readonly _rsocketConnection$ = new BehaviorSubject<RSocket | null>(
    null,
  );
  private readonly _connectionState$ = new BehaviorSubject<ConnectorStatesEnum>(
    ConnectorStatesEnum.INITIALIZING,
  );
  private connectionSubscription: Subscription | null = null;
  public readonly requestObservableKey: string = uuidv4();

  constructor(
    private readonly rsocketConnectorService: RsocketConnectorService,
    private readonly rsocketRequestFactory: RsocketRequestFactory,
    private readonly retryService: RetryService,
    private readonly configService: ConfigService,
  ) {}

  public get nextRetryTime$(): Observable<number> | undefined {
    const nextRetryTime$ = this.retryService.getNextRetryTime$(
      this.requestObservableKey,
    );

    if (!nextRetryTime$) {
      console.warn("No retry time found");
      return;
    }

    return nextRetryTime$;
  }

  retryNow(): void {
    throw new Error("Method not implemented.");
  }

  public initializeRsocketConnection() {
    this.setupRsocketService();
  }

  public get connectionState$() {
    return this._connectionState$.asObservable();
  }

  public get connectionState(): ConnectorStatesEnum {
    return this._connectionState$.getValue();
  }

  public get rsocketConnection$() {
    return this._rsocketConnection$.asObservable();
  }

  public get rsocketConnection(): RSocket | null {
    return this._rsocketConnection$.getValue();
  }

  public get rsocketRequester(): RSocketRequester | null {
    const rsocket = this.rsocketConnection;

    if (rsocket) {
      return RSocketRequester.wrap(rsocket);
    }

    return null;
  }

  private onCloseHandler(error: Error | undefined) {
    console.debug("Connection closed with error:", error);
    this._connectionState$.next(ConnectorStatesEnum.RETRYING);
    this._rsocketConnection$.next(null);
    this.connectionSubscription?.unsubscribe();
    this.setupRsocketService();
  }

  /**
   * TODO: Update #setupRsocketService method description
   * This method is called in the service's constructor.
   * If the RSocket connection is terminated for whatever reason, it is considered
   * to be COMPLETE. In this case, the RSocket's onClose handler calls this method to restart the subscription.
   * @private
   */
  private setupRsocketService() {
    const connector = this.rsocketConnectorService.connect();

    console.debug("Setting up RSocket service");

    const rsocketConnectionObservable = connector.pipe(
      tap((rsocket) => {
        console.debug(
          "Connected to server in RSocketConnectorService",
          rsocket,
        );
        this._rsocketConnection$.next(rsocket);

        // TODO: Update tests for this call moving after a successful ping
        // The issue with having this here is that for every failed connection, the onCloseHandler is called
        // and this handler bypasses the retry logic--it will retry as soon as the connection fails.
        // Moving it to after a successful ping will allow the retry logic to kick in for both
        // an unsuccessful handshake, and a failed ping. In the case the connection is closed after
        // this point (which should not happen after the server has accepted the connection and is pingable),
        // then the connection will be retried all over again. For added robustness, we could keep track of the date
        // the connection was created, and only attempt a reconnection if a certain time has passed.
        // This will prevent retrying connections if the server behaves weirdly by closing the connection soon after
        // a successful ping until a minimum time we specify. Though this is not a priority given we know how the server
        // behaves now
        // rsocket.onClose((error) => this.onCloseHandler(error))
      }),
      concatWith(
        defer(() => {
          return this.rsocketRequestFactory
            .createRequestResponse(this.rsocketRequester!, "groups.ping", null)
            .pipe(
              tap((response) => {
                console.debug("Ping response", response);
                this.rsocketConnection!.onClose((error) =>
                  this.onCloseHandler(error),
                );
                this._connectionState$.next(ConnectorStatesEnum.CONNECTED);
              }),
            );
        }),
      ),
      catchError((error) => {
        console.error("Error in RSocket Connection", error);
        this._connectionState$.next(ConnectorStatesEnum.RETRYING);
        return throwError(() => error); // return error to trigger retry behavior
      }),
    );

    this.connectionSubscription?.unsubscribe();

    this.connectionSubscription = this.retryService
      .addRetryLogic(
        rsocketConnectionObservable,
        this.requestObservableKey,
        new RetryForeverStrategy(this.configService),
      )
      .pipe(
        catchError((error) => {
          console.error(
            "Retries exhausted, giving up establishing RSocket connection",
            error,
          );
          this._connectionState$.next(ConnectorStatesEnum.RETRIES_EXHAUSTED);
          return of(EMPTY);
        }),
      )
      .subscribe();
  }
}
