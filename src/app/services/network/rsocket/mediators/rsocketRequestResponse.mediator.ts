import { AbstractRsocketRequestMediator } from "./abstractRsocketRequest.mediator";
import { RSocketRequester } from "rsocket-messaging";
import { RxRequestersFactory } from "rsocket-adapter-rxjs";
import { RequestStateEnum } from "../../../state/RequestStateEnum";
import { timeout, TimeoutError } from "rxjs";

export class RsocketRequestResponseMediator<
  TData,
  RData,
> extends AbstractRsocketRequestMediator<TData, RData> {
  sendRequest(): void {
    this.cleanUp();

    const rSocketRequester: RSocketRequester =
      this.rsocketService.rsocketRequester!;

    this.requestObservableSubscription = this.rsocketMetadataService
      .authMetadataWithRoute(this.route, rSocketRequester)
      .request(
        RxRequestersFactory.requestResponse<TData | null, RData>(
          this.data,
          this.inputCodec,
          this.outputCodec,
        ),
      )
      .pipe(timeout(5000))
      .subscribe({
        next: (data: RData) => {
          this.nextEvent(data);
          this.nextRequestState(RequestStateEnum.REQUEST_ACCEPTED);
        },
        error: (error: Error) => {
          if (error instanceof TimeoutError) {
            console.error(
              "Timeout error in RsocketRequestStreamMediator: ",
              error,
            );
            this.nextRequestState(RequestStateEnum.REQUEST_TIMEOUT);
            return;
          } else {
            this.nextRequestState(RequestStateEnum.REQUEST_REJECTED);
          }
        },
      });
  }
}
