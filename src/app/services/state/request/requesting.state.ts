import { RequestState } from "./request.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";

export class RequestingState<T> extends RequestState<T> {
  constructor(requestService: RequestServiceStateInterface<T>) {
    super(requestService);

    console.log("Requesting data...");
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

    console.error("Rsocket disconnected while requesting data.");
    this.requestService.state = new WaitingForRsocketState(this.requestService);
  }
}
