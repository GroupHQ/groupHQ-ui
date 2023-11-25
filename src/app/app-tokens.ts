import { InjectionToken } from "@angular/core";
import { AbstractRetryService } from "./services/retry/abstractRetry.service";

export const RETRY_DEFAULT = new InjectionToken<AbstractRetryService>(
  "RetryDefault",
);
export const RETRY_FOREVER = new InjectionToken<AbstractRetryService>(
  "RetryForever",
);
