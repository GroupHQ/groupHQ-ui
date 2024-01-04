import { Injectable } from "@angular/core";
import {
  encodeCompositeMetadata,
  encodeRoute,
  encodeSimpleAuthMetadata,
  WellKnownMimeType,
} from "rsocket-composite-metadata";
import { Buffer } from "buffer";
import { BufferPolyfill } from "./buffer.polyfill";

@Injectable({
  providedIn: "root",
})
export class RsocketMetadataService {
  constructor(readonly bufferPolyfill: BufferPolyfill) {}

  public authMetadata(username: string, password = "empty") {
    const encodedSimpleAuthMetadata = encodeSimpleAuthMetadata(
      username,
      password,
    );

    const map = new Map<WellKnownMimeType, Buffer>();
    map.set(
      WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
      encodedSimpleAuthMetadata,
    );

    return encodeCompositeMetadata(map);
  }

  public authMetadataWithRoute(
    route: string,
    username: string,
    password = "empty",
  ) {
    const encodedSimpleAuthMetadata = encodeSimpleAuthMetadata(
      username,
      password,
    );

    const encodedRoute: Buffer = encodeRoute(route);

    const map = new Map<WellKnownMimeType, Buffer>();
    map.set(WellKnownMimeType.MESSAGE_RSOCKET_ROUTING, encodedRoute);
    map.set(
      WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
      encodedSimpleAuthMetadata,
    );

    return encodeCompositeMetadata(map);
  }
}
