import { RequestState } from "./request.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { StateEnum } from "../StateEnum";

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
    console.error("Rsocket disconnected while receiving data.");
    this.cleanUp();
    console.log("Transitioning to WaitingForRsocketState.");
    this.requestService.state = new WaitingForRsocketState(this.requestService);
  }
}
