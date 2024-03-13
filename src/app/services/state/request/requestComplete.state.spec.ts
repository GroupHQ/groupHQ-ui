import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { BehaviorSubject } from "rxjs";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { RequestState } from "./request.state";
import { setupStateTest } from "./stateHelperSetup.spec";
import { RequestStateEnum } from "../RequestStateEnum";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { RequestingState } from "./requesting.state";
import { RsocketRetryingState } from "./rsocketRetrying.state";
import { RequestCompleteState } from "./requestComplete.state";

describe("RequestCompleteState", () => {
  let setup: {
    state: any;
    requestServiceSpy: jasmine.SpyObj<RequestServiceStateInterface<unknown>>;
    mockConnectorState$: BehaviorSubject<ConnectorStatesEnum>;
    currentStateContainer: { currentState: RequestState<any> | null };
  };

  beforeEach(() => {
    setup = setupStateTest(RequestCompleteState, ConnectorStatesEnum.CONNECTED);
  });

  it("transitions to the RequestingState when the connector is CONNECTED and a request is received", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.CONNECTED);

    setup.currentStateContainer.currentState!.onRequest();

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      RequestingState,
    );
    expect(setup.requestServiceSpy.nextRequestState).toHaveBeenCalledWith(
      RequestStateEnum.LOADING,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });

  it("transitions to the WaitingForRsocketState when the connector is RETRYING and a request is received", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.RETRYING);

    setup.currentStateContainer.currentState!.onRequest();

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      RsocketRetryingState,
    );
    expect(setup.requestServiceSpy.nextRequestState).toHaveBeenCalledWith(
      RequestStateEnum.RETRYING,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });

  it("transitions to the WaitingForRsocketState when the connector is INITIALIZING and a request is received", () => {
    spyOn(setup.state, "cleanUp");
    setup.mockConnectorState$.next(ConnectorStatesEnum.INITIALIZING);

    setup.currentStateContainer.currentState!.onRequest();

    expect(setup.currentStateContainer.currentState).toBeInstanceOf(
      WaitingForRsocketState,
    );
    expect(setup.requestServiceSpy.nextRequestState).toHaveBeenCalledWith(
      RequestStateEnum.LOADING,
    );
    expect(setup.state.cleanUp).toHaveBeenCalled();
  });
});
