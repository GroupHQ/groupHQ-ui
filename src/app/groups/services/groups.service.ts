import { Injectable } from "@angular/core";
import { GroupModel } from "../../model/group.model";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { MemberModel } from "../../model/member.model";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { BehaviorSubject } from "rxjs";
import { GroupSortingService } from "./groupSorting.service";

@Injectable({
  providedIn: "root",
})
export class GroupsService {
  private readonly _groups$ = new BehaviorSubject<GroupModel[]>([]);

  constructor(private readonly groupSortingService: GroupSortingService) {}

  get groups$() {
    return this._groups$.asObservable();
  }

  get groups() {
    return this._groups$.getValue();
  }

  set groups(groups: GroupModel[]) {
    this._groups$.next(groups);
  }

  /**
   * Adds or updates a group in the list of groups
   * Currently, the backend sends the initial group with members, and all subsequent updates without members.
   * So for any updates, we need to keep the old members and replace the group with the new group.
   * Member updates are managed separately via the addMember and removeMember methods as a result of
   * receiving member joined and member left events.
   *
   * @param group The new or updated group
   * @private
   */
  public handleGroupUpdate(group: GroupModel): GroupModel[] {
    const index = this.groups.findIndex(
      (groupInList) => group.id === groupInList.id,
    );

    if (group.status !== GroupStatusEnum.ACTIVE) {
      console.debug("Group not active, removing group", group);
      return this.removeGroup(group.id);
    } else if (index === -1) {
      console.debug("Group not found, adding group", group);
      this.groupSortingService.sortMembers(group.members);
      this.addGroup(group);
    } else {
      console.debug("Group found, replacing", group);
      const oldGroup: GroupModel = this.groups[index];
      this.groups.splice(index, 1, { ...group, members: oldGroup.members });
    }

    return this.groups;
  }

  private addGroup(groupToAdd: GroupModel) {
    const groupExists = this.groups.find((group) => group.id === groupToAdd.id);

    if (groupExists) {
      console.warn("Group already exists in list, not adding group");
      return false;
    }

    switch (this.groupSortingService.currentSort) {
      case GroupSortEnum.OLDEST:
        this.groups.push(groupToAdd);
        break;
      case GroupSortEnum.NEWEST:
        this.groups.unshift(groupToAdd);
        break;
      case GroupSortEnum.LEAST_MEMBERS:
        this.insertGroupByMemberCount(groupToAdd, GroupSortEnum.LEAST_MEMBERS);
        break;
      case GroupSortEnum.MOST_MEMBERS:
        this.insertGroupByMemberCount(groupToAdd, GroupSortEnum.MOST_MEMBERS);
        break;
      default:
        console.warn("Unrecognized sort type, adding group to end of list");
        this.groups.push(groupToAdd);
        break;
    }

    return true;
  }

  private insertGroupByMemberCount(
    group: GroupModel,
    sortType: GroupSortEnum.LEAST_MEMBERS | GroupSortEnum.MOST_MEMBERS,
  ) {
    const index =
      sortType === GroupSortEnum.LEAST_MEMBERS
        ? this.findFirstGroupWithMoreMembers(group)
        : this.findFirstGroupWithLessMembers(group);

    if (index != -1) {
      this.groups.splice(index, 0, group);
    } else {
      this.groups.push(group);
    }
  }

  private findFirstGroupWithMoreMembers(group: GroupModel): number {
    return this.groups.findIndex(
      (groupInList) => groupInList.members.length > group.members.length,
    );
  }

  private findFirstGroupWithLessMembers(group: GroupModel): number {
    return this.groups.findIndex(
      (groupInList) => groupInList.members.length < group.members.length,
    );
  }

  private removeGroup(groupId: number) {
    return (this.groups = this.groups.filter((group) => group.id !== groupId));
  }

  public addMember(member: MemberModel, groupId: number) {
    const group = this.findGroup(groupId);
    if (!group) return;

    const memberIndex = this.findMemberIndex(group, member.id);

    if (memberIndex != -1) {
      console.warn("Cannot add member: already exists in group");
      return;
    }

    group.members.push(member);

    if (this.groupSortingService.shouldSortGroupAfterSizeChange()) {
      this.groupSortingService.sortGroups(this.groups);
    }
  }

  public removeMember(memberId: number, groupId: number) {
    const group = this.findGroup(groupId);
    if (!group) return;

    const memberIndex = this.findMemberIndex(group, memberId);
    if (memberIndex == -1) {
      console.warn("Cannot remove member: member not found in group");
      return;
    }

    group.members.splice(memberIndex, 1);

    if (this.groupSortingService.shouldSortGroupAfterSizeChange()) {
      this.groupSortingService.sortGroups(this.groups);
    }
  }

  private findGroup(groupId: number) {
    const group = this.groups.find((group) => group.id === groupId);

    if (!group) {
      console.warn("Cannot find group: Group not found");
      return null;
    } else {
      return group;
    }
  }

  private findMemberIndex(group: GroupModel, memberId: number) {
    return group.members.findIndex((member) => member.id === memberId);
  }
}
