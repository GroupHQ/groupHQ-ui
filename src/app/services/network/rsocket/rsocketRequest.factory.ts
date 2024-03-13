import { Injectable } from "@angular/core";
import { RsocketService } from "./rsocket.service";
import { RsocketMetadataService } from "./rsocketMetadata.service";
import { JsonCodec } from "./codecs/JsonCodec";
import { RSocketRequester } from "rsocket-messaging";
import { RxRequestersFactory } from "rsocket-adapter-rxjs";

@Injectable({
  providedIn: "root",
})
export class RsocketRequestFactory {
  constructor(
    private readonly rsocketService: RsocketService,
    private readonly rsocketMetadataService: RsocketMetadataService,
  ) {}

  private get rsocketRequester(): RSocketRequester {
    const rsocketRequester = this.rsocketService.rsocketRequester;

    if (!rsocketRequester) {
      throw new Error("RSocket requester is not available");
    }

    return this.rsocketService.rsocketRequester;
  }

  public createRequestResponse<TData, RData>(
    route: string,
    data: TData | null,
  ) {
    return this.rsocketMetadataService
      .authMetadataWithRoute(route, this.rsocketRequester)
      .request(
        RxRequestersFactory.requestResponse<TData | null, RData>(
          data,
          this.jsonCodec<TData>(),
          this.jsonCodec<RData>(),
        ),
      );
  }

  public createRequestStream<TData, RData>(route: string, data: TData | null) {
    return this.rsocketMetadataService
      .authMetadataWithRoute(route, this.rsocketRequester)
      .request(
        RxRequestersFactory.requestStream<TData | null, RData>(
          data,
          this.jsonCodec<TData>(),
          this.jsonCodec<RData>(),
        ),
      );
  }

  private jsonCodec<T>() {
    return new JsonCodec<T>();
  }
}
