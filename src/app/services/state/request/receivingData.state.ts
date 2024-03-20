import { RequestState } from "./request.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { StateEnum } from "../StateEnum";

/**
 * This state is meant to be used by requests of data streams.
 * It represents the state of the request service when it is receiving data from that stream.
 */
export class ReceivingDataState<T> extends RequestState<T> {
  constructor(requestService: RequestServiceStateInterface<T>) {
    super(requestService);

    this.requestService.nextRequestState(StateEnum.READY);

    const subscription = this.requestService.connectorState.subscribe(
      (state) => {
        if (state !== ConnectorStatesEnum.CONNECTED) {
          this.onRsocketDisconnect();
        }
      },
    );

    this.subscriptions.add(subscription);
  }

  onRsocketDisconnect() {
    console.warn("Rsocket disconnected while receiving data.");
    this.cleanUp();
    console.debug("Transitioning to WaitingForRsocketState.");
    this.requestService.state = new WaitingForRsocketState(this.requestService);
  }
}
