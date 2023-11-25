import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { StatesEnum } from "../../model/enums/states.enum";

@Injectable()
export class StateTransitionService {
  private _currentState$ = new Subject<StatesEnum>();

  private _lastTransitionDate = Date.now();
  private _timeoutIds = new Set<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

  transitionTo(newState: StatesEnum): void {
    this._timeoutIds.clear();
    this._currentState$.next(newState);
  }

  transitionWithQueuedDelayTo(
    newState: StatesEnum,
    delay: number,
    id?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    if (!this._timeoutIds.has(id)) {
      console.log("Transition with queued delay to", newState, delay);
      this.queueTransitionTo(newState, delay);
      return;
    } else {
      this._timeoutIds.delete(id);
      this._lastTransitionDate = Date.now() + delay;
    }
    console.log("Processing Transition to", newState, delay, Date.now() / 1000);
    const timeoutId = setTimeout(() => {
      this._currentState$.next(newState);
      this._timeoutIds.delete(timeoutId);
    }, delay);

    this._timeoutIds.add(timeoutId);
  }

  private queueTransitionTo(newState: StatesEnum, delay: number): void {
    const timeLeftUntilTransitionAvailable =
      this._lastTransitionDate - Date.now();
    console.log(
      "Time left until transition available",
      timeLeftUntilTransitionAvailable,
    );
    console.log(this._lastTransitionDate / 1000);
    console.log(
      timeLeftUntilTransitionAvailable < 0
        ? 0
        : timeLeftUntilTransitionAvailable,
    );
    this._lastTransitionDate = this._lastTransitionDate + delay;
    const timeoutId = setTimeout(
      () => {
        this.transitionWithQueuedDelayTo(newState, delay, timeoutId);
      },
      timeLeftUntilTransitionAvailable < 0
        ? 0
        : timeLeftUntilTransitionAvailable,
    );

    this._timeoutIds.add(timeoutId);
  }

  get currentState$() {
    return this._currentState$.asObservable();
  }
}
