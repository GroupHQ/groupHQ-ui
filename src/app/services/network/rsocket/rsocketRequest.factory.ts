import { Injectable } from "@angular/core";
import { RsocketMetadataService } from "./rsocketMetadata.service";
import { JsonCodec } from "./codecs/JsonCodec";
import { RSocketRequester } from "rsocket-messaging";
import { RxRequestersFactory } from "rsocket-adapter-rxjs";
import { defer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RsocketRequestFactory {
  constructor(
    private readonly rsocketMetadataService: RsocketMetadataService,
  ) {}

  public createRequestResponse<TData, RData>(
    rsocketRequester: RSocketRequester,
    route: string,
    data: TData | null,
  ) {
    return defer(() =>
      this.rsocketMetadataService
        .authMetadataWithRoute(route, rsocketRequester)
        .request(
          RxRequestersFactory.requestResponse<TData | null, RData>(
            data,
            this.jsonCodec<TData>(),
            this.jsonCodec<RData>(),
          ),
        ),
    );
  }

  public createRequestStream<TData, RData>(
    rsocketRequester: RSocketRequester,
    route: string,
    data: TData | null,
  ) {
    return defer(() =>
      this.rsocketMetadataService
        .authMetadataWithRoute(route, rsocketRequester)
        .request(
          RxRequestersFactory.requestStream<TData | null, RData>(
            data,
            this.jsonCodec<TData>(),
            this.jsonCodec<RData>(),
          ),
        ),
    );
  }

  private jsonCodec<T>() {
    return new JsonCodec<T>();
  }
}
