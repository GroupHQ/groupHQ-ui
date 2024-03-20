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
import { StateEnum } from "../state/StateEnum";
import { Event } from "../../model/events/event";

/**
 * This service is responsible for managing the status of asynchronous requests.
 * In this context, asynchronous requests are requests that are sent to a server, with their
 * response expected in an event stream. This service tracks the state of the request through
 * its lifecycle, and provides an observable that can be used to observe the request's status.
 */
@Injectable({
  providedIn: "root",
})
export class AsyncRequestStatusService {
  private readonly _requestStatuses: Map<string, BehaviorSubject<StateEnum>> =
    new Map<string, BehaviorSubject<StateEnum>>();

  public getRequestStatus$(eventId: string): Observable<StateEnum> {
    if (!this._requestStatuses.has(eventId)) {
      return throwError(
        () => new Error(`Request with id ${eventId} is not being processed`),
      );
    }

    return this._requestStatuses.get(eventId)!.asObservable();
  }

  public observeRequestCompletion<T extends Event>(
    eventStream: Observable<T>,
    requestStatus$: Observable<StateEnum>,
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
      console.warn(`Request with id ${eventId} is already being processed`);
      return false;
    }

    this._requestStatuses.set(
      eventId,
      new BehaviorSubject<StateEnum>(StateEnum.DORMANT),
    );

    return true;
  }

  /**
   * Creates observers to monitor the asynchronous request status and the event stream for the response.
   * @param eventStream the event stream that the request response will be published to
   * @param requestStatus$ an observable representing the current status of the request
   * @param asyncRequestStatusSink a sink that is used to update the current status of the asynchronous request
   * @param eventId the id of the request event
   * @private
   */
  private requestResponseRace<T extends Event>(
    eventStream: Observable<T>,
    requestStatus$: Observable<StateEnum>,
    asyncRequestStatusSink: BehaviorSubject<StateEnum>,
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

  /**
   * Creates an observer that listens to the event stream for a response to the request to return.
   * @param eventStream the event stream that the request response will be published to
   * @param eventId the id of the request event
   * @param asyncRequestStatusSink a sink that is used to update the current status of the asynchronous request
   * @private
   */
  private createEventResponseEventObserver<T extends Event>(
    eventStream: Observable<T>,
    eventId: string,
    asyncRequestStatusSink: BehaviorSubject<StateEnum>,
  ): Observable<T> {
    return eventStream.pipe(
      tap((event) =>
        console.debug(`Received event with id ${eventId}: `, event),
      ),
      filter((event) => event.eventId === eventId),
      take(1),
      tap((event) => {
        asyncRequestStatusSink.next(StateEnum.EVENT_PROCESSED);
        return event;
      }),
    );
  }

  /**
   * Creates an observer that listens to the request status and the response event.
   * The completion of this observer is incidental. It is mainly meant to throw an error if
   * the request completes with an error status. This error is then caught by the parent observer,
   * which can notify the user of the error and complete the original request.
   * @param requestStatus$ an observable representing the current status of the request
   * @param responseEvent$ an observable representing the event stream that the request response will be published to
   * @param asyncRequestStatusSink a sink that is used to update the current status of the asynchronous request
   * @private
   */
  private createRequestStatusObserver<T extends Event>(
    requestStatus$: Observable<StateEnum>,
    responseEvent$: Observable<T>,
    asyncRequestStatusSink: BehaviorSubject<StateEnum>,
  ): Observable<T> {
    const terminatingStatuses = [
      StateEnum.REQUEST_ACCEPTED,
      StateEnum.REQUEST_COMPLETED,
      StateEnum.REQUEST_REJECTED,
      StateEnum.REQUEST_TIMEOUT,
    ];

    const terminatingErrorStatuses = [
      StateEnum.REQUEST_TIMEOUT,
      StateEnum.REQUEST_REJECTED,
    ];

    return requestStatus$.pipe(
      tap((status) => asyncRequestStatusSink.next(status)),
      filter((status) => terminatingStatuses.includes(status)),
      take(1),
      tap((status) => {
        if (
          asyncRequestStatusSink.getValue() !== StateEnum.EVENT_PROCESSED &&
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
    console.warn(`Error processing event with id ${eventId}: ${error}`);

    if (error instanceof TimeoutError) {
      asyncRequestStatusSink.next(StateEnum.EVENT_PROCESSING_TIMEOUT);
    }

    return throwError(() => new Error(asyncRequestStatusSink.getValue()));
  }

  private cleanUp(eventId: string) {
    const asyncRequestStatusSink = this._requestStatuses.get(eventId);

    if (!asyncRequestStatusSink) {
      console.warn(`Request with id ${eventId} is not being processed`);
      return;
    }

    this._requestStatuses.delete(eventId);
    asyncRequestStatusSink.complete();
  }
}
