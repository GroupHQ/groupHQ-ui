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
import { RxRequestersFactory } from "rsocket-adapter-rxjs";
import { JsonCodec } from "./codecs/JsonCodec";
import { UserService } from "../../user/user.service";
import { RsocketMetadataService } from "./rsocketMetadata.service";

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
  private readonly requestObservableKey: string = uuidv4();

  constructor(
    private readonly rsocketConnectorService: RsocketConnectorService,
    private readonly rsocketMetadataService: RsocketMetadataService,
    private readonly userService: UserService,
    private readonly retryService: RetryService,
    private readonly configService: ConfigService,
  ) {}

  public get nextRetryTime$(): Observable<number> {
    const nextRetryTime$ = this.retryService.getNextRetryTime$(
      this.requestObservableKey,
    );

    if (!nextRetryTime$) {
      console.warn("No retry time found");
      return new BehaviorSubject<number>(0);
    }

    return nextRetryTime$;
  }

  retryNow(): void {
    throw new Error("Method not implemented.");
  }

  public initializeRsocketConnection() {
    this.setupRsocketService(this.userService.uuid, "empty");
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
    this.setupRsocketService(this.userService.uuid);
  }

  /**
   * TODO: Update #setupRsocketService method description
   * This method is called in the service's constructor.
   * If the RSocket connection is terminated for whatever reason, it is considered
   * to be COMPLETE. In this case, the RSocket's onClose handler calls this method to restart the subscription.
   * @private
   */
  private setupRsocketService(username: string, password = "empty") {
    const connector = this.rsocketConnectorService.connect();

    console.debug("Setting up RSocket service");
    const jsonCodec = new JsonCodec<boolean>();

    const rsocketConnectionObservable = connector.pipe(
      tap((rsocket) => {
        console.debug(
          "Connected to server in RSocketConnectorService",
          rsocket,
        );
        this._rsocketConnection$.next(rsocket);

        rsocket.onClose((error) => this.onCloseHandler(error));
      }),
      concatWith(
        defer(() => {
          return this.rsocketMetadataService
            .authMetadata(this.rsocketRequester!.route("groups.ping"))
            .request(
              RxRequestersFactory.requestResponse<unknown, boolean>(
                null,
                jsonCodec,
                jsonCodec,
              ),
            )
            .pipe(
              tap((response) => {
                console.debug("Ping response", response);
                this._connectionState$.next(ConnectorStatesEnum.CONNECTED);
              }),
            );
        }),
      ),
      catchError((error) => {
        console.error("Error in RSocket Connection", error); // log error
        this._connectionState$.next(ConnectorStatesEnum.RETRYING);
        return throwError(() => error); // important! return error to trigger any retry behavior
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
          );
          this._connectionState$.next(ConnectorStatesEnum.RETRIES_EXHAUSTED);
          return of(EMPTY);
        }),
      )
      .subscribe();
  }
}
