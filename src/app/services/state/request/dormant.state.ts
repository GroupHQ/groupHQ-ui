import { RequestState } from "./request.state";
import { Observable } from "rxjs";
import { WaitingForRsocketState } from "./waitingForRsocket.state";
import { StateEnum } from "../StateEnum";

/**
 * The DormantState is the initial state of a request before the user starts it.
 * It is responsible for transitioning to the WaitingForRsocketState when a user starts a request.
 */
export class DormantState<T> extends RequestState<T> {
  override onRequest(): Observable<T> {
    this.cleanUp();
    console.debug("DormantState is transitioning to WaitingForRsocketState.");
    this.requestService.nextRequestState(StateEnum.INITIALIZING);
    this.requestService.state = new WaitingForRsocketState(this.requestService);
    return this.requestService.getEvents$();
  }
}
