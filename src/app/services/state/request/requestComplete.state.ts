import { RequestState } from "./request.state";
import { Observable } from "rxjs";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestingState } from "./requesting.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { RsocketRetryingState } from "./rsocketRetrying.state";
import { StateEnum } from "../StateEnum";

export class RequestCompleteState<T> extends RequestState<T> {
  private currentConnectorState: ConnectorStatesEnum =
    ConnectorStatesEnum.CONNECTED;

  constructor(requestService: RequestServiceStateInterface<T>) {
    super(requestService);

    const subscription = this.requestService.connectorState.subscribe(
      (state) => {
        this.currentConnectorState = state;
      },
    );

    this.subscriptions.add(subscription);
  }

  override onRequest(): Observable<T> {
    this.cleanUp();

    console.log("RequestComplete handles request.");

    switch (this.currentConnectorState) {
      case ConnectorStatesEnum.CONNECTED:
        console.log("Rsocket connected. Transitioning to RequestingState.");
        this.requestService.nextRequestState(StateEnum.LOADING);
        this.requestService.state = new RequestingState(this.requestService);
        break;
      case ConnectorStatesEnum.RETRYING:
        console.log(
          "Rsocket is retrying. Transitioning to RsocketRetryingState.",
        );
        this.requestService.nextRequestState(StateEnum.RETRYING);
        this.requestService.state = new RsocketRetryingState(
          this.requestService,
        );
        break;
      case ConnectorStatesEnum.INITIALIZING:
        console.error(
          "Rsocket is initializing. Transitioning to WaitingForRsocketState.",
        );
        this.requestService.nextRequestState(StateEnum.LOADING);
        this.requestService.state = new WaitingForRsocketState(
          this.requestService,
        );
        break;
    }

    return this.requestService.getEvents$();
  }
}
