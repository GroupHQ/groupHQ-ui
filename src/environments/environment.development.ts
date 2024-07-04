import { EnvironmentSchema } from "./environment.schema";

export const environment: EnvironmentSchema = {
  api: {
    host: "localhost",
    port: 9000,
    endpoint: "/api",
    protocol: "http",
  },
  rsocket: {
    host: "localhost",
    port: 9000,
    endpoint: "api/rsocket",
    protocol: "ws",
    keepAlive: 5,
    lifetime: 30,
    minimumDisconnectRetryTime: 5,
    maximumDisconnectRetryTime: 10,
  },
  retryServices: {
    retryDefault: {
      MAX_ATTEMPTS: 2,
      MIN_RETRY_INTERVAL: 3,
      MAX_RETRY_INTERVAL: 30,
    },
    retryForeverConstant: {
      MAX_ATTEMPTS: -1,
      MIN_RETRY_INTERVAL: 5,
      MAX_RETRY_INTERVAL: 15,
    },
  },
  groupBoardComponent: {
    loadingDelaySeconds: 1,
  },
};
