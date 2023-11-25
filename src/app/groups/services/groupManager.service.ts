import { Injectable } from "@angular/core";
import { GroupsService } from "./groups.service";
import { PublicEventModel } from "../../model/publicEvent.model";
import { GroupModel } from "../../model/group.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { Subject } from "rxjs";

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
  public groups: GroupModel[] = [];

  constructor(private readonly groupService: GroupsService) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.groupService.currentSort.subscribe((_) => {
      this.triggerSort();
    });
  }

  get groupUpdateActions$() {
    return this._groupUpdateActions$.asObservable();
  }

  handleUpdates(publicEvent: PublicEventModel) {
    console.log("Handling update");
    console.log(publicEvent);

    const group = JSON.parse(publicEvent.eventData) as GroupModel;

    switch (publicEvent.eventType) {
      case EventTypeEnum.GROUP_CREATED:
        this.addGroup(group);
        break;
      case EventTypeEnum.GROUP_STATUS_UPDATED:
        this.updateGroupStatus(publicEvent.aggregateId, group);
        break;
      case EventTypeEnum.MEMBER_JOINED: {
        const groupJoined = this.groups.find(
          (group) => group.id === publicEvent.aggregateId,
        );
        if (!groupJoined) return;
        this.updateGroupSize(publicEvent.aggregateId, {
          currentGroupSize: groupJoined.currentGroupSize + 1,
        });
        break;
      }
      case EventTypeEnum.MEMBER_LEFT: {
        const groupLeft = this.groups.find(
          (group) => group.id === publicEvent.aggregateId,
        );
        if (!groupLeft) return;
        this.updateGroupSize(publicEvent.aggregateId, {
          currentGroupSize: groupLeft.currentGroupSize - 1,
        });
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
    console.log("Pushing groups");

    this._groupUpdateActions$.next({
      updateFunction: () => {
        this.groupService.insertGroup(groupToAdd, this.groups);
      },
      eventType: EventTypeEnum.GROUP_CREATED,
      groupId: groupToAdd.id,
    });
  }

  private updateGroupStatus(groupId: number, updatedGroupInfo: GroupModel) {
    const updatedGroup = this.groupService.updateGroup(
      groupId,
      updatedGroupInfo,
      this.groups,
    );
    if (updatedGroup && updatedGroup.status !== GroupStatusEnum.ACTIVE) {
      this.removeGroup(groupId);
    }
  }

  private removeGroup(groupId: number) {
    this._groupUpdateActions$.next({
      updateFunction: () => this.groupService.removeGroup(groupId, this.groups),
      eventType: EventTypeEnum.GROUP_DISBANDED,
      groupId: groupId,
    });
  }

  private updateGroupSize(groupId: number, change: Partial<GroupModel>) {
    if (this.groupService.updateGroup(groupId, change, this.groups)) {
      if (this.groupService.shouldResortAfterSizeChange()) {
        this.triggerSort();
      }
    }
  }

  triggerSort() {
    this._groupUpdateActions$.next({
      updateFunction: () =>
        (this.groups = this.groupService.sortGroups(this.groups)),
      eventType: "SORT",
      groupId: -1,
    });
  }
}
