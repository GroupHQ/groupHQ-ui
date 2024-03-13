import { RsocketRequestMediatorFactory } from "../network/rsocket/mediators/rsocketRequestMediator.factory";
import { NotificationService } from "./notification.service";
import { Injectable } from "@angular/core";
import { RequestEvent } from "../../model/requestevent/RequestEvent";
import { Observable } from "rxjs";
import { RequestStateEnum } from "../state/RequestStateEnum";
import { GroupEventVisitor } from "./visitors/group/groupEvent.visitor";
import { EventStreamService } from "./eventStream.service";
import { AsyncRequestStatusService } from "./asyncRequestStatus.service";
import { Event } from "../../model/event";

/**
 * This service submits asynchronous RSocket requests and handles their response.
 */
@Injectable({
  providedIn: "root",
})
export class AsynchronousRequestMediator {
  constructor(
    private readonly eventStreamService: EventStreamService,
    private readonly asyncRequestStatusService: AsyncRequestStatusService,
    private readonly rsocketRequestFactory: RsocketRequestMediatorFactory,
    private readonly notificationService: NotificationService,
    private readonly groupEventVisitor: GroupEventVisitor,
  ) {}

  public submitRequestEvent<T extends Event>(
    requestEvent: RequestEvent,
    requestRoute: string,
    responseRoute: string,
  ): Observable<RequestStateEnum> {
    const eventStream = this.eventStreamService.stream<T>(responseRoute);
    const request = this.rsocketRequestFactory.createRequestResponseMediator<
      RequestEvent,
      unknown
    >(requestRoute, requestEvent);

    this.asyncRequestStatusService
      .observeRequestCompletion(
        eventStream,
        request.getState$(true),
        requestEvent.eventId,
      )
      .subscribe({
        next: (event) => {
          event.accept(this.groupEventVisitor);
        },
        error: (error) => {
          console.error(`Error processing event: ${error.message}`);
          switch (error.message) {
            case RequestStateEnum.REQUEST_TIMEOUT:
              this.handleRequestTimeoutError();
              break;
            case RequestStateEnum.EVENT_PROCESSING_TIMEOUT:
              this.handleResponseTimeoutError();
              break;
            default:
              this.handleRequestRejectedError(error);
              break;
          }
        },
      });

    return this.asyncRequestStatusService.getRequestStatus$(
      requestEvent.eventId,
    );
  }

  private handleRequestTimeoutError() {
    this.notificationService.showMessage(
      "Server is not responding. Try again?",
    );
  }

  private handleRequestRejectedError(error: Error) {
    this.notificationService.showMessage(
      `Error submitting request: ${error.message}`,
    );
  }

  private handleResponseTimeoutError() {
    this.notificationService.showMessage(
      "Your request has been accepted, but the server is still processing it. Try again?",
    );
  }
}
