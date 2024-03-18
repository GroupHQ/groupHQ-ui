import { RetryStrategy } from "./strategies/retry.strategy";
import { RetryOptions } from "./retry.options";
import {
  BehaviorSubject,
  defer,
  finalize,
  interval,
  Observable,
  ObservableInput,
  retry,
  Subject,
  takeUntil,
  throwError,
  timer,
} from "rxjs";
import { RetryData } from "./retry.data";
import { Injectable } from "@angular/core";
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class RetryService {
  private readonly retryDataMap = new Map<string, RetryData>();
  private _currentTime: () => number = () => Date.now();

  set currentTime(provider: () => number) {
    this._currentTime = provider;
  }

  get currentTime() {
    return this._currentTime;
  }

  public getNextRetryTime$(
    observableKey: string,
  ): Observable<number> | undefined {
    if (!this.retryDataMap.has(observableKey)) {
      return undefined;
    }

    const retryData: RetryData = this.retryDataMap.get(observableKey)!;

    return retryData.nextRetryInSeconds$
      .asObservable()
      .pipe(takeUntil(retryData.stopSignal$));
  }

  public addRetryLogic<T>(
    observable: Observable<T>,
    observableKey: string,
    retryStrategy: RetryStrategy,
  ): Observable<T> {
    const retryServiceOptions: RetryOptions = retryStrategy.retryServiceOptions;

    if (this.retryDataMap.has(observableKey)) {
      this.cleanupRetryData(observableKey);
    }

    const retryData: RetryData = {
      nextRetryInSeconds$: new BehaviorSubject<number>(0),
      nextRetrySubscription: null,
      version: uuidv4(),
      stopSignal$: new Subject<void>(),
    };

    this.retryDataMap.set(observableKey, retryData);

    const delayWithKey = (error: any, retryCount: number) =>
      this.getNotifier(error, retryCount, observableKey, retryServiceOptions);

    const retryObservable = observable.pipe(
      retry({
        count: retryServiceOptions.MAX_ATTEMPTS,
        delay: delayWithKey,
      }),
      takeUntil(retryData.stopSignal$),
      finalize(() => {
        console.log("Retry observable completed");
        this.cleanupRetryData(observableKey);
      }),
    );

    return defer(() => {
      if (this.observableValid(observableKey, retryData.version)) {
        return retryObservable;
      } else if (this.retryDataMap.has(observableKey)) {
        return throwError(() => new Error("Observable version mismatch"));
      } else {
        return throwError(() => new Error("Observable not found"));
      }
    });
  }
  private observableValid(observableKey: string, version: string): boolean {
    const retryData = this.retryDataMap.get(observableKey);

    if (!retryData) {
      return false;
    }

    return retryData.version === version;
  }

  private cleanupRetryData(observableKey: string) {
    const retryData = this.retryDataMap.get(observableKey);
    if (retryData) {
      retryData.nextRetryInSeconds$.complete();
      retryData.nextRetrySubscription?.unsubscribe();
      retryData.stopSignal$.next(); // unsubscribe subscribers to currently wrapped observable linked to observableKey
      this.retryDataMap.delete(observableKey);
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private getNotifier(
    error: any,
    retryCount: number,
    observableKey: string,
    retryServiceOptions: RetryOptions,
  ): ObservableInput<any> {
    console.log("Retrying...");

    const retryData = this.retryDataMap.get(observableKey);

    if (!retryData) {
      return throwError(() => new Error("Retry data not found!"));
    }

    if (retryCount >= retryServiceOptions.MAX_ATTEMPTS) {
      console.debug("Retries exhausted");
      return throwError(() => error);
    }

    const delay = this.exponentialBackoff(
      retryCount,
      retryServiceOptions.MAX_RETRY_INTERVAL,
      retryServiceOptions.MIN_RETRY_INTERVAL,
    );

    retryData.nextRetryInSeconds$.next(this.retryInSeconds(delay));
    this.updateNextRetry(delay, retryData);
    return timer(delay);
  }

  /* eslint-enable */
  private exponentialBackoff(
    attempt: number,
    cap: number,
    minimum: number,
    base = 2,
  ) {
    const jitter = Math.random();
    const backoff = Math.max(base ** attempt + jitter, minimum);
    const backoffCapped = Math.min(backoff, cap);

    console.debug(`Backoff: ${backoffCapped} seconds`);
    return backoffCapped * 1000;
  }

  private updateNextRetry(delay: number, retryData: RetryData) {
    const nextRetryDate = new Date(this.currentTime() + delay);
    retryData.nextRetrySubscription?.unsubscribe();

    retryData.nextRetrySubscription = interval(1000).subscribe(() => {
      const difference = nextRetryDate.getTime() - this.currentTime();
      const seconds = Math.floor(difference / 1000);
      retryData.nextRetryInSeconds$.next(seconds > 0 ? seconds : 0);
    });
  }

  protected retryInSeconds(delay: number) {
    const retryDate = this.currentTime() + delay;
    const timeUntilRetry = retryDate - this.currentTime();
    return Math.floor(timeUntilRetry / 1000);
  }
}
