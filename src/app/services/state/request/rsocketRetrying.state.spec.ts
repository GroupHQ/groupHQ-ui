import { RsocketRetryingState } from "./rsocketRetrying.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestState } from "./request.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { BehaviorSubject } from "rxjs";
import { setupStateTest } from "./stateHelperSetup.spec";
import { RequestingState } from "./requesting.state";

describe("RsocketRetryingState", () => {
  let setup: {
    state: any;
    requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<unknown>>;
    mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
    currentStateContainer: { currentState: RequestState<any> | null };
  };

  beforeEach(() => {
    setup = setupStateTest(RsocketRetryingState, ConnectorStatesEnum.RETRYING);
  });

  it("should clean up and transition to the RequestingState when the connector is CONNECTED", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.CONNECTED);

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      RequestingState,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });
});
