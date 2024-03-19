import { BehaviorSubject, Subject, Subscription } from "rxjs";

export interface RetryData {
  nextRetryInSeconds$: BehaviorSubject<number>;
  nextRetrySubscription: Subscription | null;
  version: string;
  stopSignal$: Subject<void>;
}
