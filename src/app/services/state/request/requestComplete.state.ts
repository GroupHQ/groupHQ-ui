import { RequestState } from "./request.state";
import { Observable, Subscription } from "rxjs";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";
import { RequestingState } from "./requesting.state";
import { ConnectorStatesEnum } from "../../network/rsocket/ConnectorStatesEnum";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { RsocketRetryingState } from "./rsocketRetrying.state";
import { RequestStateEnum } from "../RequestStateEnum";

export class RequestCompleteState<T> extends RequestState<T> {
  private currentConnectorState: ConnectorStatesEnum =
    ConnectorStatesEnum.CONNECTED;

  constructor(requestService: RequestServiceStateInterface<T>) {
    super(requestService);

    this.requestService.nextRequestState(RequestStateEnum.REQUEST_ACCEPTED);

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
        this.requestService.nextRequestState(RequestStateEnum.LOADING);
        this.requestService.state = new RequestingState(this.requestService);
        break;
      case ConnectorStatesEnum.RETRYING:
        console.log(
          "Rsocket is retrying. Transitioning to RsocketRetryingState.",
        );
        this.requestService.nextRequestState(RequestStateEnum.RETRYING);
        this.requestService.state = new RsocketRetryingState(
          this.requestService,
        );
        break;
      case ConnectorStatesEnum.INITIALIZING:
        console.error(
          "Rsocket is initializing. Transitioning to WaitingForRsocketState.",
        );
        this.requestService.nextRequestState(RequestStateEnum.LOADING);
        this.requestService.state = new WaitingForRsocketState(
          this.requestService,
        );
        break;
    }

    return this.requestService.events$;
  }
}
