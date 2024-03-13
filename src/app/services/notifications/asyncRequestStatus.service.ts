import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  finalize,
  Observable,
  race,
  switchMap,
  take,
  tap,
  throwError,
  timeout,
  TimeoutError,
} from "rxjs";
import { RequestStateEnum } from "../state/RequestStateEnum";
import { Event } from "../../model/event";

/**
 * This service is responsible for managing the status of asynchronous requests.
 * In this context, asynchronous requests are requests that are sent to a server, with their
 * response expected in an event stream. This service tracks the state of the request through
 * its lifecycle, and provides an observable that can be used to observe the request's status.
 *
 */
@Injectable({
  providedIn: "root",
})
export class AsyncRequestStatusService {
  private readonly _requestStatuses: Map<
    string,
    BehaviorSubject<RequestStateEnum>
  > = new Map<string, BehaviorSubject<RequestStateEnum>>();

  public getRequestStatus$(eventId: string): Observable<RequestStateEnum> {
    if (!this._requestStatuses.has(eventId)) {
      return throwError(
        () => new Error(`Request with id ${eventId} is not being processed`),
      );
    }

    return this._requestStatuses.get(eventId)!.asObservable();
  }

  public observeRequestCompletion<T extends Event>(
    eventStream: Observable<T>,
    requestStatus$: Observable<RequestStateEnum>,
    eventId: string,
  ): Observable<T> {
    if (!this.putSink(eventId)) return EMPTY;

    const asyncRequestStatusSink = this._requestStatuses.get(eventId)!;

    this._requestStatuses.set(eventId, asyncRequestStatusSink);

    const requestResponseRace = this.requestResponseRace(
      eventStream,
      requestStatus$,
      asyncRequestStatusSink,
      eventId,
    );

    return requestResponseRace.pipe(
      catchError((error) => this.handleRequestError(eventId, error)),
      finalize(() => this.cleanUp(eventId)),
    );
  }

  private putSink(eventId: string): boolean {
    if (this._requestStatuses.has(eventId)) {
      console.error(`Request with id ${eventId} is already being processed`);
      return false;
    }

    this._requestStatuses.set(
      eventId,
      new BehaviorSubject<RequestStateEnum>(RequestStateEnum.DORMANT),
    );

    return true;
  }

  private requestResponseRace<T extends Event>(
    eventStream: Observable<T>,
    requestStatus$: Observable<RequestStateEnum>,
    asyncRequestStatusSink: BehaviorSubject<RequestStateEnum>,
    eventId: string,
  ): Observable<T> {
    const responseEvent$ = this.createEventResponseEventObserver(
      eventStream,
      eventId,
      asyncRequestStatusSink,
    );
    const requestEvent$ = this.createRequestStatusObserver(
      requestStatus$,
      responseEvent$,
      asyncRequestStatusSink,
    );

    return race(requestEvent$, responseEvent$).pipe(timeout(7000));
  }

  private createEventResponseEventObserver<T extends Event>(
    eventStream: Observable<T>,
    eventId: string,
    asyncRequestStatusSink: BehaviorSubject<RequestStateEnum>,
  ): Observable<T> {
    return eventStream.pipe(
      filter((event) => event.eventId === eventId),
      take(1),
      tap((event) => {
        asyncRequestStatusSink.next(RequestStateEnum.EVENT_PROCESSED);
        return event;
      }),
    );
  }

  private createRequestStatusObserver<T extends Event>(
    requestStatus$: Observable<RequestStateEnum>,
    responseEvent$: Observable<T>,
    asyncRequestStatusSink: BehaviorSubject<RequestStateEnum>,
  ): Observable<T> {
    const terminatingStatuses = [
      RequestStateEnum.REQUEST_ACCEPTED,
      RequestStateEnum.REQUEST_REJECTED,
      RequestStateEnum.REQUEST_TIMEOUT,
    ];

    const terminatingErrorStatuses = [
      RequestStateEnum.REQUEST_TIMEOUT,
      RequestStateEnum.REQUEST_REJECTED,
    ];

    return requestStatus$.pipe(
      tap((status) => asyncRequestStatusSink.next(status)),
      filter((status) => terminatingStatuses.includes(status)),
      take(1),
      tap((status) => {
        if (
          asyncRequestStatusSink.getValue() !==
            RequestStateEnum.EVENT_PROCESSED &&
          terminatingErrorStatuses.includes(status)
        ) {
          throw new Error(status);
        }
      }),
      switchMap(() => responseEvent$),
    );
  }

  private handleRequestError(eventId: string, error: Error) {
    const asyncRequestStatusSink = this._requestStatuses.get(eventId)!;
    console.error(`Error processing event with id ${eventId}: ${error}`);

    if (error instanceof TimeoutError) {
      asyncRequestStatusSink.next(RequestStateEnum.EVENT_PROCESSING_TIMEOUT);
    }

    return throwError(() => new Error(asyncRequestStatusSink.getValue()));
  }

  private cleanUp(eventId: string) {
    const asyncRequestStatusSink = this._requestStatuses.get(eventId);

    if (!asyncRequestStatusSink) {
      console.error(`Request with id ${eventId} is not being processed`);
      return;
    }

    this._requestStatuses.delete(eventId);
    asyncRequestStatusSink.complete();
  }
}
