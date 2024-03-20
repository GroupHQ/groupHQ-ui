import { RequestState } from "./request.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { StateEnum } from "../StateEnum";

/**
 * This class represents the state of the request service when it begins the request process,
 * occurring after the backed connector is ready (e.g. when an RSocket or WebSocket connection is ready).
 */
export class RequestingState<T> extends RequestState<T> {
  constructor(requestService: RequestServiceStateInterface<T>) {
    super(requestService);

    console.debug("Requesting data...");
    this.requestService.nextRequestState(StateEnum.REQUESTING);
    this.requestService.sendRequest();

    const subscription = this.requestService.connectorState.subscribe(
      (state) => {
        if (
          state === ConnectorStatesEnum.INITIALIZING ||
          state === ConnectorStatesEnum.RETRYING
        ) {
          this.onRsocketDisconnect();
        }
      },
    );

    this.subscriptions.add(subscription);
  }

  onRsocketDisconnect(): void {
    this.cleanUp();

    console.warn("Rsocket disconnected while requesting data.");
    this.requestService.state = new WaitingForRsocketState(this.requestService);
  }
}
