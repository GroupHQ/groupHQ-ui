import { RequestState } from "./request.state";
import { Observable } from "rxjs";
import { WaitingForRsocketState } from "./waitingForRsocket.state";

export class DormantState<T> extends RequestState<T> {
  override onRequest(): Observable<T> {
    this.cleanUp();
    console.log("DormantState handles request.");
    console.log("DormantState is transitioning to WaitingForRsocketState.");
    this.requestService.state = new WaitingForRsocketState(this.requestService);
    return this.requestService.events$;
  }
}
