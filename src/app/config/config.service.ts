import { Injectable } from "@angular/core";
import { RetryOptions } from "../services/retry/retry.options";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  public get retryServices() {
    return environment.retryServices;
  }

  public get getGroupBoardLoadingDelaySeconds() {
    return environment.groupBoardComponent.loadingDelaySeconds;
  }

  public get rsocketHost() {
    return environment.rsocket.host;
  }

  public get rsocketPort() {
    return environment.rsocket.port;
  }

  public get rsocketEndpoint() {
    return environment.rsocket.endpoint;
  }

  public get rsocketProtocol() {
    return environment.rsocket.protocol;
  }

  public get rsocketKeepAlive() {
    return environment.rsocket.keepAlive;
  }

  public get rsocketLifetime() {
    return environment.rsocket.lifetime;
  }

  public get rsocketMinimumDisconnectRetryTime() {
    return environment.rsocket.minimumDisconnectRetryTime;
  }

  public get rsocketMaximumDisconnectRetryTime() {
    return environment.rsocket.maximumDisconnectRetryTime;
  }

  public get apiHost() {
    return environment.api.host;
  }

  public get apiPort() {
    return environment.api.port;
  }

  public get apiEndpoint() {
    return environment.api.endpoint;
  }

  public get apiProtocol() {
    return environment.api.protocol;
  }

  public get retryDefaultStrategy(): RetryOptions {
    return {
      MAX_ATTEMPTS: environment.retryServices.retryDefault.MAX_ATTEMPTS ?? 5,
      MIN_RETRY_INTERVAL:
        environment.retryServices.retryDefault.MIN_RETRY_INTERVAL ?? 5,
      MAX_RETRY_INTERVAL:
        environment.retryServices.retryDefault.MAX_RETRY_INTERVAL ?? 5,
    };
  }

  public get retryForeverStrategy(): RetryOptions {
    const MAX_RETRY_ATTEMPTS =
      environment.retryServices.retryForeverConstant.MAX_ATTEMPTS == -1
        ? Number.MAX_VALUE
        : environment.retryServices.retryForeverConstant.MAX_ATTEMPTS;

    return {
      MAX_ATTEMPTS: MAX_RETRY_ATTEMPTS ?? Number.MAX_VALUE,
      MIN_RETRY_INTERVAL:
        environment.retryServices.retryForeverConstant.MIN_RETRY_INTERVAL ?? 5,
      MAX_RETRY_INTERVAL:
        environment.retryServices.retryForeverConstant.MAX_RETRY_INTERVAL ?? 5,
    };
  }
}
