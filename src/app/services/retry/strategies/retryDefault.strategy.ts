import { RetryOptions } from "../retry.options";
import { RetryStrategy } from "./retry.strategy";
import { ConfigService } from "../../../config/config.service";

export class RetryDefaultStrategy implements RetryStrategy {
  protected _retryServiceOptions: RetryOptions = {
    MAX_ATTEMPTS: 5,
    MIN_RETRY_INTERVAL: 5,
    MAX_RETRY_INTERVAL: 5,
  };

  constructor(readonly configService: ConfigService) {
    console.debug(configService);

    if (configService?.retryDefaultStrategy) {
      this._retryServiceOptions = configService?.retryDefaultStrategy;
    }
  }

  public get retryServiceOptions(): RetryOptions {
    return this._retryServiceOptions;
  }
}
