import { Injectable } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
import { RsocketRequestsService } from "../network/rsocket/requests/rsocketRequests.service";
import { RsocketService } from "../network/rsocket/rsocket.service";
import { RsocketPrivateUpdateStreamService } from "../network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { BehaviorSubject } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class UserService {
  private myUuid: string;
  public readonly MY_UUID_KEY = "myUuid";
  private _currentGroupId = new BehaviorSubject<number | null>(null);
  private _currentMemberId = new BehaviorSubject<number | null>(null);

  constructor(
    private readonly rsocketService: RsocketService,
    private readonly rsocketRequestsService: RsocketRequestsService,
    private readonly rsocketPrivateUpdateStreamService: RsocketPrivateUpdateStreamService,
  ) {
    this.myUuid = this.saveOrGetUuidFromLocalStorage();
    rsocketService.initializeRsocketConnection(this.uuid);
    this.rsocketPrivateUpdateStreamService.initializePrivateUpdateStream(
      this.uuid,
    );
    this.initializeCurrentMember();
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

  private initializeCurrentMember() {
    const subscription = this.rsocketService.isConnectionReady$.subscribe(
      (status) => {
        if (status) {
          console.log("Connection ready. Sending member request");

          this.rsocketRequestsService.currentMemberForUser((member) => {
            if (member) {
              this._currentGroupId.next(member?.groupId);
              this._currentMemberId.next(member?.id);
            }
          }, this.uuid);

          subscription.unsubscribe();
        }
      },
    );
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
