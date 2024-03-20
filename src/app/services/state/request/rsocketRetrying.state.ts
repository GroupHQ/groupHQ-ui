import { RequestState } from "./request.state";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestingState } from "./requesting.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";

export class RsocketRetryingState<T> extends RequestState<T> {
  constructor(requestService: RequestServiceStateInterface<T>) {
    console.debug("Rsocket is retrying...");
    super(requestService);

    const subscription = this.requestService.connectorState.subscribe(
      (state) => {
        if (state === ConnectorStatesEnum.CONNECTED) {
          this.onReady();
        }
      },
    );

    this.subscriptions.add(subscription);
  }

  onReady(): void {
    this.cleanUp();
    console.debug(
      "Rsocket connected after retry. Transitioning to RequestingState.",
    );
    this.requestService.state = new RequestingState(this.requestService);
  }
}
