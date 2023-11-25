import { BehaviorSubject, Observable } from "rxjs";

export interface RetryServiceOptions {
  MAX_RETRY_ATTEMPTS?: number;
  MIN_RETRY_INTERVAL?: number;
  MAX_RETRY_INTERVAL?: number;
}

export abstract class AbstractRetryService {
  protected abstract readonly MAX_RETRY_ATTEMPTS?: number;
  protected abstract readonly MIN_RETRY_INTERVAL?: number;
  protected abstract readonly MAX_RETRY_INTERVAL?: number;
  protected abstract readonly _nextRetryInSeconds$: BehaviorSubject<
    number | null
  >;

  abstract get nextRetryInSeconds$(): BehaviorSubject<number | null>;

  abstract addRetryLogic<T>(observable: Observable<T>): Observable<T>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  protected abstract getNotifier(error: any, retryCount: number): any;
}
