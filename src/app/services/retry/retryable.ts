import { Observable } from "rxjs";

export interface Retryable {
  nextRetryTime$(): Observable<number>;
  retryNow(): void;
}
