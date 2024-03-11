import { RetryOptions } from "../retry.options";

export interface RetryStrategy {
  get retryServiceOptions(): RetryOptions;
}
