import { Injectable } from "@angular/core";
import { RetryService } from "../../../retry/retry.service";
import { RsocketRequestStreamMediator } from "./rsocketRequestStream.mediator";
import { ConfigService } from "../../../../config/config.service";
import { UserService } from "../../../user/user.service";
import { RsocketService } from "../rsocket.service";
import { RsocketMetadataService } from "../rsocketMetadata.service";
import { RsocketRequestResponseMediator } from "./rsocketRequestResponse.mediator";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";

@Injectable({
  providedIn: "root",
})
export class RsocketRequestFactory {
  constructor(
    private readonly rsocketService: RsocketService,
    private readonly rsocketMetadataService: RsocketMetadataService,
    private readonly retryService: RetryService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  createRequestResponseMediator<TData, RData>(
    route: string,
    data?: TData,
  ): RequestServiceComponentInterface<RData> {
    return new RsocketRequestResponseMediator<TData, RData>(
      this.rsocketService,
      this.rsocketMetadataService,
      this.retryService,
      this.userService,
      this.configService,
      route,
      data ?? null,
    );
  }

  createStreamMediator<TData, RData>(
    route: string,
    data?: TData,
  ): RequestServiceComponentInterface<RData> {
    return new RsocketRequestStreamMediator<TData, RData>(
      this.rsocketService,
      this.rsocketMetadataService,
      this.retryService,
      this.userService,
      this.configService,
      route,
      data ?? null,
    );
  }
}
