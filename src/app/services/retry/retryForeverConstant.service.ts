import { BehaviorSubject, Observable, ObservableInput, retry } from "rxjs";
import { AbstractRetryService } from "./abstractRetry.service";
import { Injectable } from "@angular/core";
import { ConfigService } from "../../config/config.service";

@Injectable()
export class RetryForeverConstantService extends AbstractRetryService {
  public readonly MAX_RETRY_ATTEMPTS: number = Number.MAX_VALUE;
  public readonly MIN_RETRY_INTERVAL: number = 5;
  public readonly MAX_RETRY_INTERVAL: number = 5;
  protected readonly _nextRetryInSeconds$ = new BehaviorSubject<number | null>(
    null,
  );

  constructor(readonly configService?: ConfigService) {
    super();
    console.log(configService);
    const retryConfig = configService?.retryServices.retryForeverConstant;

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
    return observable.pipe(
      retry({
        count: Number.MAX_VALUE,
        delay: this.getNotifier.bind(this),
      }),
    );
  }

  private jitter() {
    return Math.random() * 1000;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
  protected getNotifier(_: any, __: number): ObservableInput<any> {
    const delay = this.MIN_RETRY_INTERVAL * 1000 + this.jitter();

    return new Observable((observer) => {
      this.nextRetryInSeconds$.next(Math.floor(delay / 1000));
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, delay);
    });
  }
  /* eslint-enable */
}
