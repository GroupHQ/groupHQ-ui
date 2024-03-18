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
   * 3 phases:
   * 1. Attempts connection to server
   * 2. Once connection is established, attempts to ping the server
   * 3. If ping is successful, sets connection state to CONNECTED and registers onClose handler
   * If connection or ping attempts fail, this method will retry based on the provided retry strategy
   * (currently RetryForeverStrategy). If the connection is closed after these steps, the registered
   * onClose handler calls #onCloseHandler to attempt to recreate the connection.
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
