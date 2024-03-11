import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestState } from "./request.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { BehaviorSubject } from "rxjs";
import { setupStateTest } from "./stateHelperSetup.spec";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { DormantState } from "./dormant.state";

describe("DormantState", () => {
  let setup: {
    state: any;
    requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<unknown>>;
    mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
    currentStateContainer: { currentState: RequestState<any> | null };
  };

  beforeEach(() => {
    setup = setupStateTest(DormantState, ConnectorStatesEnum.INITIALIZING);
  });

  it("transitions to the WaitingForRsocketState when a request is received", () => {
    spyOn(setup.state, "cleanUp");
    setup.currentStateContainer.currentState!.onRequest();

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      WaitingForRsocketState,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });
});
