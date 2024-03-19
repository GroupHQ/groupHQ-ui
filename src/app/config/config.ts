import { RetryOptions } from "../services/retry/retry.options";
import { InjectionToken } from "@angular/core";

export type Config = {
  api: {
    host: string;
    port: number;
    endpoint: string;
    protocol: string;
  };
  rsocket: {
    host: string;
    port: number;
    endpoint: string;
    protocol: string;
    keepAlive: number;
    lifetime: number;
    minimumDisconnectRetryTime: number;
    maximumDisconnectRetryTime: number;
  };
  retryServices: {
    retryDefault: RetryOptions;
    retryForeverConstant: RetryOptions;
  };
  groupBoardComponent: {
    loadingDelaySeconds: number;
  };
};

export const APP_CONFIG: InjectionToken<Config> = new InjectionToken<Config>(
  "Application Config",
);
