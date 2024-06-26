import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { StateEnum } from "../../services/state/StateEnum";
import { PublicEventModel } from "../../model/events/publicEvent.model";
import { GroupsService } from "./groups.service";
import { EventVisitor } from "../../services/eventvisitors/eventVisitor";

/**
 * Helper service to manage and update both the request and component states based
 * on both the request states and the events that are received.
 */
@Injectable({
  providedIn: "root",
})
export class StateUpdateService {
  private readonly _requestState$: BehaviorSubject<StateEnum> =
    new BehaviorSubject<StateEnum>(StateEnum.INITIALIZING);
  private _componentState$: BehaviorSubject<StateEnum> =
    new BehaviorSubject<StateEnum>(StateEnum.INITIALIZING);

  constructor(private readonly groupService: GroupsService) {}

  get requestState$() {
    return this._requestState$.asObservable();
  }

  get requestState() {
    return this._requestState$.getValue();
  }

  get componentState$() {
    return this._componentState$.asObservable();
  }

  get componentState() {
    return this._componentState$.getValue();
  }

  public handleEventAndUpdateStates(
    event: PublicEventModel,
    eventVisitor: EventVisitor,
  ) {
    if (this._requestState$.getValue() !== StateEnum.READY) {
      this.groupService.groups = []; // TODO: Would need to make this group-agnostic if class ever used outside of groups
    }

    event.accept(eventVisitor);

    if (this._requestState$.getValue() !== StateEnum.READY) {
      this._requestState$.next(StateEnum.READY);
      this._componentState$.next(StateEnum.READY);
    }
  }

  public handleNewRequestState(state: StateEnum) {
    if (state !== StateEnum.READY) {
      this._requestState$.next(state);
      this.componentStateMapper(state);
    }
  }

  /**
   * Maps the given state to a corresponding component state and updates the component state if necessary.
   * Components are not interested in all states, but only a subset of them.
   * @param state
   * @private
   */
  private componentStateMapper(state: StateEnum) {
    if (this._componentState$.getValue() === StateEnum.READY) {
      return;
    }

    let mappedStatus: StateEnum;

    switch (state) {
      case StateEnum.READY:
        mappedStatus = StateEnum.READY;
        break;
      case StateEnum.LOADING:
      case StateEnum.REQUESTING:
        mappedStatus =
          this._componentState$.getValue() === StateEnum.INITIALIZING
            ? StateEnum.INITIALIZING
            : StateEnum.LOADING;
        break;
      case StateEnum.RETRYING:
        mappedStatus = StateEnum.RETRYING;
        break;
      default:
        mappedStatus = this._componentState$.getValue();
    }

    if (mappedStatus !== this._componentState$.getValue()) {
      this._componentState$.next(mappedStatus);
    }
  }
}
