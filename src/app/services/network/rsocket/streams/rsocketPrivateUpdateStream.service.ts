import { Injectable } from "@angular/core";
import { PrivateEventModel } from "../../../../model/privateEvent.model";
import { BehaviorSubject, Subject } from "rxjs";
import {
  Cancellable,
  OnExtensionSubscriber,
  Payload,
  Requestable,
  RSocket,
} from "rsocket-core";
import { RsocketService } from "../rsocket.service";
import { RsocketMetadataService } from "../rsocketMetadata.service";
import { Buffer } from "buffer";

@Injectable({
  providedIn: "root",
})
export class RsocketPrivateUpdateStreamService {
  private _privateUpdatesStream$ = new Subject<PrivateEventModel>();
  private readonly _isPrivateUpdatesStreamReady$ = new BehaviorSubject<boolean>(
    false,
  );
  private _privateUpdatesStream:
    | (Requestable & Cancellable & OnExtensionSubscriber)
    | null = null;

  constructor(
    private readonly rsocketService: RsocketService,
    private readonly rsocketMetadataService: RsocketMetadataService,
  ) {}

  public initializePrivateUpdateStream(username: string, password = "empty") {
    this.rsocketService.rsocketConnection$.subscribe((rsocket) => {
      if (rsocket) {
        console.debug("RSocket is ready. Creating private update stream");
        this.createPrivateUpdateStream(rsocket, username, password);
        this._isPrivateUpdatesStreamReady$.next(true);
      } else {
        this._isPrivateUpdatesStreamReady$.next(false);
      }
    });
  }

  public get isPrivateUpdatesStreamReady$() {
    return this._isPrivateUpdatesStreamReady$.asObservable();
  }

  public get isPrivateUpdatesStreamReady(): boolean {
    return this._isPrivateUpdatesStreamReady$.getValue();
  }

  public get privateUpdatesStream$() {
    return this._privateUpdatesStream$.asObservable();
  }

  /**
   * Creates the privateUpdatesStream$.
   * @private
   */
  private createPrivateUpdateStream(
    rsocket: RSocket,
    username: string,
    password = "empty",
  ) {
    if (!rsocket) {
      throw new Error("RSocket is not initialized");
    }

    console.debug("Establishing Private Update Stream");
    const PRIVATE_UPDATES_ROUTES = "groups.updates.user";
    const metadata = this.rsocketMetadataService.authMetadataWithRoute(
      PRIVATE_UPDATES_ROUTES,
      username,
      password,
    );

    this._privateUpdatesStream?.cancel();
    this._privateUpdatesStream = rsocket.requestStream(
      {
        data: null,
        metadata,
      },
      2100000000,
      {
        onError: (error: Error) => {
          this._isPrivateUpdatesStreamReady$.next(false);
          console.debug(
            `An error has occurred on the ${PRIVATE_UPDATES_ROUTES} request stream`,
            error,
          );
          this._privateUpdatesStream$?.error(error);
        },
        onNext: (payload: Payload, isComplete: boolean) => {
          const event = this.generatePrivateEvent(payload.data);
          if (event) {
            this._privateUpdatesStream$?.next(event);
          }

          console.debug("Received payload. Data: ", event);
          console.debug("Event data: ", event?.eventData);
          console.debug("IsStreamComplete:", isComplete);
        },
        onComplete: () => {
          this._isPrivateUpdatesStreamReady$.next(false);
          console.debug(`${PRIVATE_UPDATES_ROUTES} stream completed`);
          this._privateUpdatesStream$?.complete();
        },
        onExtension: () => {
          console.debug("This is required but not used");
        },
      },
    );
  }

  private generatePrivateEvent(
    data: Buffer | null | undefined,
  ): PrivateEventModel | null {
    if (!data) {
      return null;
    }

    return JSON.parse(data.toString()) as PrivateEventModel;
  }
}
