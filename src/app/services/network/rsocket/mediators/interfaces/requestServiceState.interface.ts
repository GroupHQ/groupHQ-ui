import { StateEnum } from "../../../../state/StateEnum";
import { RequestState } from "../../../../state/request/request.state";
import { Observable } from "rxjs";
import { ConnectorStatesEnum } from "../../ConnectorStatesEnum";

/**
 * Encapsulates the methods and attributes needed to manage the state and event of a request.
 * See {@link RequestState} implementations for examples of how to use this interface.
 * See {@link AbstractRsocketRequestMediator} for an example of a class that implements this interface.
 */
export interface RequestServiceStateInterface<T> {
  get connectorState(): Observable<ConnectorStatesEnum>;
  set state(state: RequestState<T>);
  sendRequest(): void;
  cleanUp(): void;
  getEvents$(start?: boolean): Observable<T>;
  nextEvent(value: T): void;
  completeEvents(): void;
  nextRequestState(value: StateEnum): void;
}
