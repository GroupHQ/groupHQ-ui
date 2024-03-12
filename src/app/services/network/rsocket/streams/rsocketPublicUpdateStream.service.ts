// import { Injectable } from "@angular/core";
// import {
//   Cancellable,
//   OnExtensionSubscriber,
//   Payload,
//   Requestable,
//   RSocket,
// } from "rsocket-core";
// import { Buffer } from "buffer";
// import { PublicEventModel } from "../../../../model/publicEvent.model";
// import { BehaviorSubject, Subject } from "rxjs";
// import { RsocketMetadataService } from "../rsocketMetadata.service";
// import { RsocketService } from "../rsocket.service";
//
// @Injectable({
//   providedIn: "root",
// })
// export class RsocketPublicUpdateStreamService {
//   private _publicUpdatesStream$ = new Subject<PublicEventModel>();
//   private readonly _isPublicUpdatesStreamReady$ = new BehaviorSubject<boolean>(
//     false,
//   );
//   private _publicUpdatesStream:
//     | (Requestable & Cancellable & OnExtensionSubscriber)
//     | null = null;
//
//   constructor(
//     private readonly rsocketService: RsocketService,
//     private readonly rsocketMetadataService: RsocketMetadataService,
//   ) {}
//
//   public initializePublicUpdateStream(username: string, password = "empty") {
//     if (this._isPublicUpdatesStreamReady$.getValue()) {
//       console.debug("Public update stream is already initialized");
//       return;
//     }
//
//     this.rsocketService.rsocketConnection$.subscribe((rsocket) => {
//       if (rsocket) {
//         console.debug("RSocket is ready. Creating public update stream");
//         this.createPublicUpdateStream(rsocket, username, password);
//         this._isPublicUpdatesStreamReady$.next(true);
//       } else {
//         console.debug("RSocket is not ready");
//         this._isPublicUpdatesStreamReady$.next(false);
//       }
//     });
//   }
//
//   public get isPublicUpdatesStreamReady$() {
//     return this._isPublicUpdatesStreamReady$.asObservable();
//   }
//
//   public get publicUpdatesStream$() {
//     return this._publicUpdatesStream$.asObservable();
//   }
//
//   /**
//    * Creates the publicUpdatesStream$.
//    * @private
//    */
//   private createPublicUpdateStream(
//     rsocket: RSocket,
//     username: string,
//     password = "empty",
//   ) {
//     if (!rsocket) {
//       throw new Error("RSocket is not initialized");
//     }
//
//     console.debug("Establishing Public Update Stream");
//     const PUBLIC_UPDATES_ROUTES = "groups.updates.all";
//     const metadata = this.rsocketMetadataService.authMetadataWithRoute(
//       PUBLIC_UPDATES_ROUTES,
//       username,
//       password,
//     );
//
//     this._publicUpdatesStream?.cancel();
//     this._publicUpdatesStream = rsocket.requestStream(
//       {
//         data: null,
//         metadata: metadata,
//       },
//       2100000000,
//       {
//         onError: (error: Error) => {
//           this._isPublicUpdatesStreamReady$.next(false);
//           console.debug(
//             `An error has occurred on the ${PUBLIC_UPDATES_ROUTES} request stream`,
//             error,
//           );
//           this._publicUpdatesStream$?.error(error);
//         },
//         onNext: (payload: Payload, isComplete: boolean) => {
//           const event = this.generatePublicEvent(payload.data);
//           if (event) {
//             this._publicUpdatesStream$?.next(event);
//           }
//
//           console.debug("Received payload. Data: ", event);
//           console.debug("Event data: ", event?.eventData);
//           console.debug("IsStreamComplete:", isComplete);
//         },
//         onComplete: () => {
//           this._isPublicUpdatesStreamReady$.next(false);
//           console.debug(`${PUBLIC_UPDATES_ROUTES} stream completed`);
//           this._publicUpdatesStream$?.complete();
//         },
//         onExtension: () => {
//           console.debug("This is required but not used");
//         },
//       },
//     );
//   }
//
//   private generatePublicEvent(
//     data: Buffer | null | undefined,
//   ): PublicEventModel | null {
//     if (!data) {
//       return null;
//     }
//
//     return JSON.parse(data.toString()) as PublicEventModel;
//   }
// }
