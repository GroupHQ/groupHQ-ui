import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { BehaviorSubject } from "rxjs";
import { RequestState } from "./request.state";
import { RequestStateEnum } from "../RequestStateEnum";
import { RequestingState } from "./requesting.state";
import { RsocketRetryingState } from "./rsocketRetrying.state";
import { setupStateTest } from "./stateHelperSetup.spec";

describe("WaitingForRsocketState", () => {
  let setup: {
    state: any;
    requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<unknown>>;
    mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
    currentStateContainer: { currentState: RequestState<any> | null };
  };

  beforeEach(() => {
    setup = setupStateTest(
      WaitingForRsocketState,
      ConnectorStatesEnum.INITIALIZING,
    );
  });

  it("should clean up and transition to the RequestingState when the connector is CONNECTED", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.CONNECTED);

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      RequestingState,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });

  it("should clean up and transition to the RsocketRetrying state when the connector is RETRYING", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.RETRYING);

    expect(setup.requestServiceSpy.nextRequestState).toHaveBeenCalledWith(
      RequestStateEnum.RETRYING,
    );
    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      RsocketRetryingState,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });
});
