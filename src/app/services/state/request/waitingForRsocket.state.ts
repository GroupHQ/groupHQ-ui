import { RequestState } from "./request.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestingState } from "./requesting.state";
import { RsocketRetryingState } from "./rsocketRetrying.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { StateEnum } from "../StateEnum";

export class WaitingForRsocketState<T> extends RequestState<T> {
  constructor(requestService: RequestServiceStateInterface<T>) {
    console.debug("Waiting for Rsocket connection to be ready...");
    super(requestService);

    const subscription = this.requestService.connectorState.subscribe(
      (state) => {
        if (state === ConnectorStatesEnum.CONNECTED) {
          this.onReady();
        } else if (state === ConnectorStatesEnum.RETRYING) {
          this.onRetrying();
        }
      },
    );

    this.subscriptions.add(subscription);
  }

  onReady(): void {
    this.cleanUp();
    console.debug("Rsocket connected. Transitioning to RequestingState.");
    this.requestService.state = new RequestingState(this.requestService);
  }

  onRetrying(): void {
    this.cleanUp();
    console.debug(
      "Rsocket is retrying. Transitioning to RsocketRetryingState.",
    );
    this.requestService.nextRequestState(StateEnum.RETRYING);
    this.requestService.state = new RsocketRetryingState(this.requestService);
  }
}
