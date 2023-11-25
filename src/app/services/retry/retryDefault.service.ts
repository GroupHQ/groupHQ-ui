import { BehaviorSubject, Observable, ObservableInput, retry } from "rxjs";
import { AbstractRetryService } from "./abstractRetry.service";
import { Injectable } from "@angular/core";
import { ConfigService } from "../../config/config.service";

@Injectable()
export class RetryDefaultService extends AbstractRetryService {
  public readonly MAX_RETRY_ATTEMPTS: number = 7;
  public readonly MIN_RETRY_INTERVAL: number = 5;
  public readonly MAX_RETRY_INTERVAL: number = 60;
  protected readonly _nextRetryInSeconds$ = new BehaviorSubject<number | null>(
    null,
  );
  private nextRetryIntervalId: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(readonly configService?: ConfigService) {
    super();
    console.log(configService);
    const retryConfig = configService?.retryServices.retryDefault;

    if (!retryConfig) {
      return;
    }

    this.MAX_RETRY_ATTEMPTS =
      retryConfig.MAX_RETRY_ATTEMPTS ?? this.MAX_RETRY_ATTEMPTS;
    this.MIN_RETRY_INTERVAL =
      retryConfig.MIN_RETRY_INTERVAL ?? this.MIN_RETRY_INTERVAL;
    this.MAX_RETRY_INTERVAL =
      retryConfig.MAX_RETRY_INTERVAL ?? this.MAX_RETRY_INTERVAL;
  }

  public get nextRetryInSeconds$() {
    return this._nextRetryInSeconds$;
  }

  public addRetryLogic<T>(observable: Observable<T>) {
    clearInterval(this.nextRetryIntervalId);
    return observable.pipe(
      retry({
        count: this.MAX_RETRY_ATTEMPTS,
        delay: this.getNotifier.bind(this),
      }),
    );
  }

  private exponentialBackoff(
    attempt: number,
    base = 2,
    cap: number = this.MAX_RETRY_INTERVAL,
    minimum: number = this.MIN_RETRY_INTERVAL,
  ) {
    const jitter = Math.random() * 1000;
    const minimumBackoff = minimum * 1000 + jitter;
    const backoff = Math.min(base ** attempt, cap) * 1000 + jitter;

    console.log(Math.min(base ** attempt, cap));
    return Math.max(backoff, minimumBackoff);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  protected getNotifier(error: any, retryCount: number): ObservableInput<any> {
    console.log(this);
    if (retryCount < this.MAX_RETRY_ATTEMPTS) {
      const delay = this.exponentialBackoff(retryCount);

      return new Observable((observer) => {
        this.nextRetryInSeconds$.next(this.retryInSeconds(delay));
        this.updateRetryTimer(delay);
        setTimeout(() => {
          observer.next();
          observer.complete();
        }, delay);
      });
    } else {
      return new Observable((observer) => {
        this.nextRetryInSeconds$.next(null);
        observer.error(error);
      });
    }
  }
  /* eslint-enable */

  private updateRetryTimer(delay: number) {
    const nextRetryDate = new Date(Date.now() + delay);
    clearInterval(this.nextRetryIntervalId);
    this.nextRetryIntervalId = setInterval(() => {
      const difference = nextRetryDate.getTime() - Date.now();
      const seconds = Math.floor(difference / 1000);
      this.nextRetryInSeconds$.next(seconds);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.nextRetryInSeconds$.getValue()! <= 0) {
        clearInterval(this.nextRetryIntervalId);
      }
    }, 1000);
  }

  protected retryInSeconds(delay: number) {
    const retryDate = Date.now() + delay;
    const timeUntilRetry = retryDate - Date.now();
    return Math.floor(timeUntilRetry / 1000);
  }
}
