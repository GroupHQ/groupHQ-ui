import { Injectable } from "@angular/core";
import {
  encodeCompositeMetadata,
  encodeRoute,
  encodeSimpleAuthMetadata,
  WellKnownMimeType,
} from "rsocket-composite-metadata";
import { Buffer } from "buffer";
import { IdentificationService } from "../../user/identification.service";
import { BufferPolyfill } from "./buffer.polyfill";

@Injectable({
  providedIn: "root",
})
export class RsocketMetadataService {
  constructor(
    readonly bufferPolyfill: BufferPolyfill,
    private readonly idService: IdentificationService,
  ) {}

  public getAuthMetadataOnly() {
    const encodedSimpleAuthMetadata = encodeSimpleAuthMetadata(
      this.idService.uuid,
      "empty",
    );

    const map = new Map<WellKnownMimeType, Buffer>();
    map.set(
      WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
      encodedSimpleAuthMetadata,
    );

    return encodeCompositeMetadata(map);
  }

  public getMetadata(route: string) {
    const encodedSimpleAuthMetadata = encodeSimpleAuthMetadata(
      this.idService.uuid,
      "empty",
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
