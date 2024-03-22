import { Injectable } from "@angular/core";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { RsocketRequestMediatorFactory } from "./rsocketRequestMediator.factory";
import { Observable, throwError } from "rxjs";
import { StateEnum } from "../../../state/StateEnum";

/**
 * This service is responsible for managing event streams.
 * It provides a method to subscribe to a stream of events, creating a new stream if necessary.
 * It also keeps track of the streams it has created, so that it can return the same stream if it is requested again.
 * Streams are backed by {@link AbstractRsocketRequestMediator} instances, which return shareable observables for
 * events and request statuses.
 */
@Injectable({
  providedIn: "root",
})
export class EventStreamService {
  private readonly _eventStreams: Map<
    string,
    RequestServiceComponentInterface<any>
  >;

  constructor(
    private readonly rsocketRequestFactory: RsocketRequestMediatorFactory,
  ) {
    this._eventStreams = new Map<
      string,
      RequestServiceComponentInterface<any>
    >();
  }

  public stream<T>(route: string): Observable<T> {
    const savedStream = this._eventStreams.get(route);

    if (savedStream) {
      return savedStream.getEvents$();
    }

    const newStream = this.rsocketRequestFactory.createStreamMediator<
      unknown,
      T
    >(route, null);
    this._eventStreams.set(route, newStream);

    return newStream.getEvents$(true);
  }

  public streamStatus(route: string): Observable<StateEnum> {
    if (!this._eventStreams.has(route)) {
      return throwError(
        () => new Error(`No stream status for response route: ${route}`),
      );
    }

    return this._eventStreams.get(route)!.getState$();
  }

  public retryTime(route: string): Observable<number> | undefined {
    if (!this._eventStreams.has(route)) {
      throw new Error(`No stream status for response route: ${route}`);
    }

    return this._eventStreams.get(route)!.nextRetryTime$;
  }
}
