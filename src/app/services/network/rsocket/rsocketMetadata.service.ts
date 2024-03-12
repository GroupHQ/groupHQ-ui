import { Injectable } from "@angular/core";
import {
  encodeCompositeMetadata,
  encodeSimpleAuthMetadata,
  WellKnownMimeType,
} from "rsocket-composite-metadata";
import { Buffer } from "buffer";
import { BufferPolyfill } from "./buffer.polyfill";
import { UserService } from "../../user/user.service";
import { RequestSpec, RSocketRequester } from "rsocket-messaging";

@Injectable({
  providedIn: "root",
})
export class RsocketMetadataService {
  constructor(
    readonly bufferPolyfill: BufferPolyfill,
    readonly userService: UserService,
  ) {}

  private get encodedSimpleAuthMetadata(): Buffer {
    const username = this.userService.uuid;
    const password = "empty";

    return encodeSimpleAuthMetadata(username, password);
  }

  public authMetadataAsBuffer() {
    const map = new Map<WellKnownMimeType, Buffer>();
    map.set(
      WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
      this.encodedSimpleAuthMetadata,
    );

    return encodeCompositeMetadata(map);
  }

  public authMetadata(requestSpec: RequestSpec): RequestSpec {
    return requestSpec.metadata(
      WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
      this.encodedSimpleAuthMetadata,
    );
  }

  public authMetadataWithRoute(
    route: string,
    rsocketRequester: RSocketRequester,
  ): RequestSpec {
    return this.authMetadata(rsocketRequester.route(route));
  }
}
