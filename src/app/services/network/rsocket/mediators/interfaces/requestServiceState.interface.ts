import { StateEnum } from "../../../../state/StateEnum";
import { RequestState } from "../../../../state/request/request.state";
import { Observable } from "rxjs";
import { ConnectorStatesEnum } from "../../ConnectorStatesEnum";

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
