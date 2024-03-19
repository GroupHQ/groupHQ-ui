import { RetryStrategy } from "./retry.strategy";
import { ConfigService } from "../../../config/config.service";
import { RetryOptions } from "../retry.options";

export class RetryForeverStrategy implements RetryStrategy {
  protected _retryServiceOptions: RetryOptions = {
    MAX_ATTEMPTS: Number.MAX_VALUE,
    MIN_RETRY_INTERVAL: 5,
    MAX_RETRY_INTERVAL: 5,
  };

  constructor(readonly configService: ConfigService) {
    console.debug(configService);

    if (configService?.retryForeverStrategy) {
      this._retryServiceOptions = configService?.retryForeverStrategy;
    }
  }

  public get retryServiceOptions(): RetryOptions {
    return this._retryServiceOptions;
  }
}
