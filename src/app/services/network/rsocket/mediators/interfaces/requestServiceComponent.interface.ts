import { Observable } from "rxjs";
import { StateEnum } from "../../../../state/StateEnum";
import { Retryable } from "../../../../retry/retryable";

/**
 * Encapsulates the methods and attributes needed to observe the state and responses of a request.
 * See {@link EventStreamService} and its usages for an example of how this interface is used.
 * See {@link AbstractRsocketRequestMediator} for an example of a class that implements this interface.
 */
export interface RequestServiceComponentInterface<T> extends Retryable {
  onRequest(): Observable<T>;
  getEvents$(start?: boolean): Observable<T>;
  getState$(start?: boolean): Observable<StateEnum>;
}
