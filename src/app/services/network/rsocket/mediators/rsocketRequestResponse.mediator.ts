import { AbstractRsocketRequestMediator } from "./abstractRsocketRequest.mediator";
import { RequestStateEnum } from "../../../state/RequestStateEnum";
import { timeout, TimeoutError } from "rxjs";

export class RsocketRequestResponseMediator<
  TData,
  RData,
> extends AbstractRsocketRequestMediator<TData, RData> {
  sendRequest(): void {
    this.cleanUp();

    this.requestObservableSubscription = this.rsocketRequestFactory
      .createRequestResponse<TData, RData>(this.route, this.data)
      .pipe(timeout(5000))
      .subscribe({
        next: (data: RData) => {
          this.nextEvent(data);
          this.nextRequestState(RequestStateEnum.REQUEST_ACCEPTED);
        },
        error: (error: Error) => {
          if (error instanceof TimeoutError) {
            console.error("Timeout error in RsocketRequestMediator: ", error);
            this.nextRequestState(RequestStateEnum.REQUEST_TIMEOUT);
            return;
          } else {
            this.nextRequestState(RequestStateEnum.REQUEST_REJECTED);
          }
        },
      });
  }
}
