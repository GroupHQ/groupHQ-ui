import { Observable } from "rxjs";
import { RequestStateEnum } from "../../../../state/RequestStateEnum";
import { Retryable } from "../../../../retry/retryable";

export interface RequestServiceComponentInterface<T> extends Retryable {
  start(): boolean;
  onRequest(): Observable<T>;
  get events$(): Observable<T>;
  get state$(): Observable<RequestStateEnum>;
}
