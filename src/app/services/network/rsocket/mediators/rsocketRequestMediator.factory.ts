import { Injectable } from "@angular/core";
import { RetryService } from "../../../retry/retry.service";
import { RsocketRequestStreamMediator } from "./rsocketRequestStream.mediator";
import { ConfigService } from "../../../../config/config.service";
import { UserService } from "../../../user/user.service";
import { RsocketService } from "../rsocket.service";
import { RsocketRequestResponseMediator } from "./rsocketRequestResponse.mediator";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { RsocketRequestFactory } from "../rsocketRequest.factory";

@Injectable({
  providedIn: "root",
})
export class RsocketRequestMediatorFactory {
  constructor(
    private readonly rsocketService: RsocketService,
    private readonly rsocketRequestFactory: RsocketRequestFactory,
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
      this.rsocketRequestFactory,
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
      this.rsocketRequestFactory,
      this.retryService,
      this.userService,
      this.configService,
      route,
      data ?? null,
    );
  }
}
