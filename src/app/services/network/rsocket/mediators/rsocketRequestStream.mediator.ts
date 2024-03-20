import { AbstractRsocketRequestMediator } from "./abstractRsocketRequest.mediator";
import { RequestCompleteState } from "../../../state/request/requestComplete.state";
import { ReceivingDataState } from "../../../state/request/receivingData.state";
import { StateEnum } from "../../../state/StateEnum";
import { RetryDefaultStrategy } from "../../../retry/strategies/retryDefault.strategy";
import { catchError, throwError } from "rxjs";

export class RsocketRequestStreamMediator<
  TData,
  RData,
> extends AbstractRsocketRequestMediator<TData, RData> {
  sendRequest(): void {
    this.cleanUp();

    const requestObservable = this.rsocketRequestFactory
      .createRequestStream<
        TData,
        RData
      >(this.rsocketService.rsocketRequester!, this.route, this.data)
      .pipe(
        catchError((error) => {
          console.warn("Error in RsocketRequestStreamMediator: ", error);
          this.nextRequestState(StateEnum.RETRYING);
          return throwError(() => error);
        }),
      );

    const requestObservableWithRetry = this.retryService.addRetryLogic(
      requestObservable,
      this.requestObservableKey,
      new RetryDefaultStrategy(this.configService),
    );

    this.requestObservableSubscription = requestObservableWithRetry.subscribe({
      next: (data: RData) => {
        if (!(this.state instanceof ReceivingDataState)) {
          console.debug("RsocketRequestResponseMediator: next");
          console.debug("Transitioning to ReceivingDataState.");
          this.state.cleanUp();
          this.state = new ReceivingDataState(this);
        }
        console.debug("Received data: ", data);
        this.nextEvent(data);
      },
      error: (error: Error) => {
        console.warn("Error in RsocketRequestResponseMediator: ", error);
        console.debug("Transitioning to RequestCompleteState.");
        this.nextRequestState(StateEnum.REQUEST_REJECTED);
        this.state.cleanUp();
        this.state = new RequestCompleteState(this);
      },
      complete: () => {
        console.debug("RsocketRequestResponseMediator: complete");
        console.debug("Transitioning to RequestCompleteState.");
        if (this.currentState !== StateEnum.REQUEST_REJECTED) {
          this.state.cleanUp();
          this.nextRequestState(StateEnum.REQUEST_COMPLETED);
          this.state = new RequestCompleteState(this);
        }

        this.completeEvents();
      },
    });
  }
}
