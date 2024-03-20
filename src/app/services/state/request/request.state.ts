import { Observable, Subscription } from "rxjs";
import { RequestServiceStateInterface } from "../../network/rsocket/mediators/interfaces/requestServiceState.interface";

export abstract class RequestState<T> {
  protected readonly subscriptions: Subscription = new Subscription();

  constructor(
    protected readonly requestService: RequestServiceStateInterface<T>,
  ) {}

  onRequest(): Observable<T> {
    console.debug("Returning existing events$.");
    return this.requestService.getEvents$();
  }

  cleanUp(): void {
    this.subscriptions.unsubscribe();
  }
}
