import { Injectable } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private myUuid: string;
  public readonly MY_UUID_KEY = "myUuid";
  private _currentGroupId = new BehaviorSubject<number | null>(null);
  private _currentMemberId = new BehaviorSubject<number | null>(null);

  constructor() {
    this.myUuid = this.saveOrGetUuidFromLocalStorage();
  }

  get currentGroupId$() {
    return this._currentGroupId.asObservable();
  }

  get currentGroupId(): number | null {
    return this._currentGroupId.getValue();
  }

  get currentMemberId(): number | null {
    return this._currentMemberId.getValue();
  }

  set currentGroupId(value: number | null) {
    this._currentGroupId.next(value);
  }

  set currentMemberId(value: number | null) {
    this._currentMemberId.next(value);
  }

  private saveOrGetUuidFromLocalStorage() {
    let uuid = localStorage.getItem(this.MY_UUID_KEY);
    if (!uuid) {
      console.debug("localStorage.getItem(this.MY_UUID_KEY) === null");
      uuid = this.saveNewUuidToLocalStorage();
    }

    return uuid;
  }

  private saveNewUuidToLocalStorage() {
    const uuid = uuidv4();
    localStorage.setItem(this.MY_UUID_KEY, uuid);
    return uuid;
  }

  get uuid(): string {
    if (localStorage.getItem(this.MY_UUID_KEY) !== this.myUuid) {
      this.myUuid = this.saveNewUuidToLocalStorage();
    }

    return this.myUuid;
  }
}
