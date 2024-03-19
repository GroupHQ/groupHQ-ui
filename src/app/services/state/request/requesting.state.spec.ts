import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestState } from "./request.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { BehaviorSubject } from "rxjs";
import { setupStateTest } from "./stateHelperSetup.spec";
import { RequestingState } from "./requesting.state";
import { WaitingForRsocketState } from "./waitingForRsocket.state";

describe("RequestingState", () => {
  let setup: {
    state: any;
    requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<unknown>>;
    mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
    currentStateContainer: { currentState: RequestState<any> | null };
  };

  beforeEach(() => {
    setup = setupStateTest(RequestingState, ConnectorStatesEnum.CONNECTED);
  });

  it("should send the request", () => {
    expect(setup.requestServiceSpy.sendRequest).toHaveBeenCalled();
  });

  it("should clean up and transition to the RsocketRetryingState when the connector is not CONNECTED", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.INITIALIZING);

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      WaitingForRsocketState,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });
});
