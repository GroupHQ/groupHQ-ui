import { Injectable } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
@Injectable({
  providedIn: "root",
})
export class IdentificationService {
  private myUuid: string;
  public readonly MY_UUID_KEY = "myUuid";

  constructor() {
    this.myUuid = this.saveOrGetUuidFromLocalStorage();
  }

  private saveOrGetUuidFromLocalStorage() {
    let uuid = localStorage.getItem(this.MY_UUID_KEY);
    if (!uuid) {
      console.log("localStorage.getItem(this.MY_UUID_KEY) === null");
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
