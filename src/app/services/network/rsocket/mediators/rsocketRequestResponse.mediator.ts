import { AbstractRsocketRequestMediator } from "./abstractRsocketRequest.mediator";
import { StateEnum } from "../../../state/StateEnum";
import { timeout, TimeoutError } from "rxjs";

export class RsocketRequestResponseMediator<
  TData,
  RData,
> extends AbstractRsocketRequestMediator<TData, RData> {
  sendRequest(): void {
    this.cleanUp();

    this.requestObservableSubscription = this.rsocketRequestFactory
      .createRequestResponse<TData, RData>(
        this.rsocketService.rsocketRequester!,
        this.route,
        this.data,
      )
      .pipe(timeout(5000))
      .subscribe({
        next: (data: RData) => {
          this.nextEvent(data);
          this.nextRequestState(StateEnum.REQUEST_ACCEPTED);
        },
        complete: () => {
          this.nextRequestState(StateEnum.REQUEST_COMPLETED);
          this.completeEvents();
        },
        error: (error: Error) => {
          if (error instanceof TimeoutError) {
            console.warn("Timeout error in RsocketRequestMediator: ", error);
            this.nextRequestState(StateEnum.REQUEST_TIMEOUT);
            return;
          } else {
            this.nextRequestState(StateEnum.REQUEST_REJECTED);
          }
        },
      });
  }
}
