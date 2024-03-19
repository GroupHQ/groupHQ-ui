import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, Config } from "./config";
import { RetryOptions } from "../services/retry/retry.options";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  constructor(@Inject(APP_CONFIG) private readonly config: Config) {}

  public get retryServices() {
    return this.config.retryServices;
  }

  public get getGroupBoardLoadingDelaySeconds() {
    return this.config.groupBoardComponent.loadingDelaySeconds;
  }

  public get rsocketHost() {
    return this.config.rsocket.host;
  }

  public get rsocketPort() {
    return this.config.rsocket.port;
  }

  public get rsocketEndpoint() {
    return this.config.rsocket.endpoint;
  }

  public get rsocketProtocol() {
    return this.config.rsocket.protocol;
  }

  public get rsocketKeepAlive() {
    return this.config.rsocket.keepAlive;
  }

  public get rsocketLifetime() {
    return this.config.rsocket.lifetime;
  }

  public get rsocketMinimumDisconnectRetryTime() {
    return this.config.rsocket.minimumDisconnectRetryTime;
  }

  public get rsocketMaximumDisconnectRetryTime() {
    return this.config.rsocket.maximumDisconnectRetryTime;
  }

  public get apiHost() {
    return this.config.api.host;
  }

  public get apiPort() {
    return this.config.api.port;
  }

  public get apiEndpoint() {
    return this.config.api.endpoint;
  }

  public get apiProtocol() {
    return this.config.api.protocol;
  }

  public get retryDefaultStrategy(): RetryOptions {
    return {
      MAX_ATTEMPTS: this.config.retryServices.retryDefault.MAX_ATTEMPTS ?? 5,
      MIN_RETRY_INTERVAL:
        this.config.retryServices.retryDefault.MIN_RETRY_INTERVAL ?? 5,
      MAX_RETRY_INTERVAL:
        this.config.retryServices.retryDefault.MAX_RETRY_INTERVAL ?? 5,
    };
  }

  public get retryForeverStrategy(): RetryOptions {
    const MAX_RETRY_ATTEMPTS =
      this.config.retryServices.retryForeverConstant.MAX_ATTEMPTS == -1
        ? Number.MAX_VALUE
        : this.config.retryServices.retryForeverConstant.MAX_ATTEMPTS;

    return {
      MAX_ATTEMPTS: MAX_RETRY_ATTEMPTS ?? Number.MAX_VALUE,
      MIN_RETRY_INTERVAL:
        this.config.retryServices.retryForeverConstant.MIN_RETRY_INTERVAL ?? 5,
      MAX_RETRY_INTERVAL:
        this.config.retryServices.retryForeverConstant.MAX_RETRY_INTERVAL ?? 5,
    };
  }
}
