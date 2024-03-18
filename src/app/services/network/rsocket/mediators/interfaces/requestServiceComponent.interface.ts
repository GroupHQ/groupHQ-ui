import { Observable } from "rxjs";
import { StateEnum } from "../../../../state/StateEnum";
import { Retryable } from "../../../../retry/retryable";

export interface RequestServiceComponentInterface<T> extends Retryable {
  onRequest(): Observable<T>;
  getEvents$(start?: boolean): Observable<T>;
  getState$(start?: boolean): Observable<StateEnum>;
}
