import { Injectable } from "@angular/core";
import { GroupsService } from "./groups.service";
import { PublicEventModel } from "../../model/publicEvent.model";
import { GroupModel } from "../../model/group.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { BehaviorSubject, Subject } from "rxjs";
import { MemberModel } from "../../model/member.model";

export interface GroupUpdate {
  updateFunction: () => void;
  eventType: EventTypeEnum | "SORT";
  groupId: number;
}

@Injectable({
  providedIn: "root",
})
export class GroupManagerService {
  private _groupUpdateActions$ = new Subject<GroupUpdate>();
  public readonly groups = new BehaviorSubject<GroupModel[]>([]);

  constructor(private readonly groupService: GroupsService) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.groupService.currentSort.subscribe((_) => {
      this.triggerSort();
    });
  }

  get groups$() {
    return this.groups.asObservable();
  }

  get groupUpdateActions$() {
    return this._groupUpdateActions$.asObservable();
  }

  handleUpdates(publicEvent: PublicEventModel) {
    console.debug("Handling update");
    console.debug(publicEvent);

    const group = JSON.parse(publicEvent.eventData) as GroupModel;

    switch (publicEvent.eventType) {
      case EventTypeEnum.GROUP_CREATED:
        this.addGroup(group);
        break;
      case EventTypeEnum.GROUP_UPDATED:
        this.updateGroup(group);
        break;
      case EventTypeEnum.MEMBER_JOINED: {
        const groupJoined = this.groups
          .getValue()
          .find((group) => group.id === publicEvent.aggregateId);
        if (!groupJoined) return;
        const member = JSON.parse(publicEvent.eventData) as MemberModel;
        this.updateGroupSize(member, groupJoined, EventTypeEnum.MEMBER_JOINED);
        break;
      }
      case EventTypeEnum.MEMBER_LEFT: {
        const groupLeft = this.groups
          .getValue()
          .find((group) => group.id === publicEvent.aggregateId);
        if (!groupLeft) return;
        const member = JSON.parse(publicEvent.eventData) as MemberModel;
        this.updateGroupSize(member, groupLeft, EventTypeEnum.MEMBER_LEFT);
        break;
      }
      default:
        break;
    }
  }

  private addGroup(groupToAdd: GroupModel) {
    if (!groupToAdd || !groupToAdd.id || !groupToAdd.title) {
      return;
    }
    console.debug("Pushing groups");

    this._groupUpdateActions$.next({
      updateFunction: () => {
        this.groupService.insertGroup(groupToAdd, this.groups.getValue());
      },
      eventType: EventTypeEnum.GROUP_CREATED,
      groupId: groupToAdd.id,
    });
  }

  private updateGroup(updatedGroup: GroupModel) {
    this.groups.next(
      this.groupService.updateGroup(updatedGroup, this.groups.getValue()),
    );
  }

  private updateGroupSize(
    member: MemberModel,
    group: GroupModel,
    event: EventTypeEnum.MEMBER_JOINED | EventTypeEnum.MEMBER_LEFT,
  ) {
    let memberListUpdated;
    if (event === EventTypeEnum.MEMBER_JOINED) {
      memberListUpdated = this.groupService.addMember(member, group);
    } else {
      console.debug("Removing member");
      memberListUpdated = this.groupService.removeMember(member.id, group);
    }

    if (memberListUpdated && this.groupService.shouldResortAfterSizeChange()) {
      this.triggerSort();
    }
  }

  triggerSort() {
    this._groupUpdateActions$.next({
      updateFunction: () =>
        this.groups.next(this.groupService.sortGroups(this.groups.getValue())),
      eventType: "SORT",
      groupId: -1,
    });
  }
}
