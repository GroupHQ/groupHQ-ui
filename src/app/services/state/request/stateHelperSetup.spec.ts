import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { BehaviorSubject } from "rxjs";
import { RequestState } from "./request.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";

export function setupStateTest<T, S extends RequestState<T>>(
  StateClass: new (requestService: RequestServiceStateInterface<T>) => S,
  currentConnectorState: ConnectorStatesEnum,
): {
  state: S;
  requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<T>>;
  mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
  currentStateContainer: { currentState: RequestState<T> | null };
} {
  const mockConnectorState$ = new BehaviorSubject<ConnectorStatesEnum>(
    currentConnectorState,
  );
  const currentStateContainer: { currentState: RequestState<T> | null } = {
    currentState: null,
  };

  const requestServiceSpy = jasmine.createSpyObj<
    RequestServiceStateInterface<T>
  >("RequestServiceStateInterface", [
    "getEvents$",
    "sendRequest",
    "cleanUp",
    "nextEvent",
    "nextRequestState",
  ]);

  Object.defineProperty(requestServiceSpy, "connectorState", {
    get: () => mockConnectorState$.asObservable(),
  });

  Object.defineProperty(requestServiceSpy, "state", {
    get: () => currentStateContainer.currentState,
    set: (state: RequestState<T>) =>
      (currentStateContainer.currentState = state),
    configurable: true,
  });

  const state = new StateClass(requestServiceSpy);
  currentStateContainer.currentState = state;

  return {
    state,
    requestServiceSpy,
    mockConnectorState$,
    currentStateContainer,
  };
}
