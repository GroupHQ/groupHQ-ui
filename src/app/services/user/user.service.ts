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

  public setUserInGroup(groupId: number, memberId: number) {
    this._currentGroupId.next(groupId);
    this._currentMemberId.next(memberId);
  }

  public removeUserFromGroup() {
    this._currentGroupId.next(null);
    this._currentMemberId.next(null);
  }

  private saveOrGetUuidFromLocalStorage() {
    let uuid = localStorage.getItem(this.MY_UUID_KEY);
    if (!uuid) {
      console.debug("Saving new user uuid to local storage");
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
