import { RequestStateEnum } from "../../../../state/RequestStateEnum";
import { RequestState } from "../../../../state/request/request.state";
import { Observable } from "rxjs";
import { ConnectorStatesEnum } from "../../ConnectorStatesEnum";

export interface RequestServiceStateInterface<T> {
  start(): boolean;
  get connectorState(): Observable<ConnectorStatesEnum>;
  set state(state: RequestState<T>);
  sendRequest(): void;
  cleanUp(): void;
  get events$(): Observable<T>;
  nextEvent(value: T): void;
  nextRequestState(value: RequestStateEnum): void;
}