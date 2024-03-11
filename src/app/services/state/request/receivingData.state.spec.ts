import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestState } from "./request.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { BehaviorSubject } from "rxjs";
import { setupStateTest } from "./stateHelperSetup.spec";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { ReceivingDataState } from "./receivingData.state";
import { RequestStateEnum } from "../RequestStateEnum";

describe("ReceivingDataState", () => {
  let setup: {
    state: any;
    requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<unknown>>;
    mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
    currentStateContainer: { currentState: RequestState<any> | null };
  };

  beforeEach(() => {
    setup = setupStateTest(ReceivingDataState, ConnectorStatesEnum.CONNECTED);
  });

  it("sets the request state to READY", () => {
    expect(setup.requestServiceSpy.nextRequestState).toHaveBeenCalledWith(
      RequestStateEnum.READY,
    );
  });

  it("transitions to the WaitingForRsocketState when the connector is not CONNECTED", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.INITIALIZING);

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      WaitingForRsocketState,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });
});
