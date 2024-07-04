import { EnvironmentSchema } from "./environment.schema";

export const environment: EnvironmentSchema = {
  api: {
    port: 443,
    host: "grouphq.org",
    endpoint: "/api",
    protocol: "https",
  },
  rsocket: {
    host: "grouphq.org",
    port: 443,
    endpoint: "api/rsocket",
    protocol: "wss",
    keepAlive: 5,
    lifetime: 30,
    minimumDisconnectRetryTime: 5,
    maximumDisconnectRetryTime: 10,
  },
  retryServices: {
    retryDefault: {
      MAX_ATTEMPTS: 7,
      MIN_RETRY_INTERVAL: 3,
      MAX_RETRY_INTERVAL: 60,
    },
    retryForeverConstant: {
      MAX_ATTEMPTS: -1,
      MIN_RETRY_INTERVAL: 5,
      MAX_RETRY_INTERVAL: -1,
    },
  },
  groupBoardComponent: {
    loadingDelaySeconds: 1,
  },
};
