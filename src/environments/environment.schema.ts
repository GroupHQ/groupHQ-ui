import { RetryOptions } from "../app/services/retry/retry.options";

export type EnvironmentSchema = {
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
