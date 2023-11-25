import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, Config } from "./config";

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
}
