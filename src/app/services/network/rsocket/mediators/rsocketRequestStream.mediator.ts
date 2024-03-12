import { RSocketRequester } from "rsocket-messaging";
import { AbstractRsocketRequestMediator } from "./abstractRsocketRequest.mediator";
import { RxRequestersFactory } from "rsocket-adapter-rxjs";
import { RequestCompleteState } from "../../../state/request/requestComplete.state";
import { ReceivingDataState } from "../../../state/request/receivingData.state";
import { RequestStateEnum } from "../../../state/RequestStateEnum";
import { RetryDefaultStrategy } from "../../../retry/strategies/retryDefault.strategy";
import { catchError, throwError } from "rxjs";

export class RsocketRequestStreamMediator<
  TData,
  RData,
> extends AbstractRsocketRequestMediator<TData, RData> {
  sendRequest(): void {
    this.cleanUp();

    const rSocketRequester: RSocketRequester =
      this.rsocketService.rsocketRequester!;

    const requestObservable = this.rsocketMetadataService
      .authMetadataWithRoute(this.route, rSocketRequester)
      .request(
        RxRequestersFactory.requestStream<TData | null, RData>(
          this.data,
          this.inputCodec,
          this.outputCodec,
        ),
      )
      .pipe(
        catchError((error) => {
          console.error("Error in RsocketRequestStreamMediator: ", error);
          this.nextRequestState(RequestStateEnum.RETRYING);
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
          console.log("RsocketRequestResponseMediator: next");
          console.log("Transitioning to ReceivingDataState.");
          this.state.cleanUp();
          this.state = new ReceivingDataState(this);
        }
        console.log("Received data: ", data);
        this.nextEvent(data);
      },
      error: (error: Error) => {
        console.error("Error in RsocketRequestResponseMediator: ", error);
        console.log("Transitioning to RetryingState.");
        this.nextRequestState(RequestStateEnum.REQUEST_REJECTED);
        this.state.cleanUp();
        this.state = new RequestCompleteState(this);
      },
      complete: () => {
        console.log("RsocketRequestResponseMediator: complete");
        console.log("Transitioning to ResponseAcceptedState.");
        if (this.currentState !== RequestStateEnum.REQUEST_REJECTED) {
          this.state.cleanUp();
          this.nextRequestState(RequestStateEnum.REQUEST_COMPLETED);
          this.state = new RequestCompleteState(this);
        }
      },
    });
  }
}
