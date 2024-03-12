import { Observable } from "rxjs";

export interface Retryable {
  get nextRetryTime$(): Observable<number>;
  retryNow(): void;
}
