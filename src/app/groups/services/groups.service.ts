import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { GroupModel } from "../../model/group.model";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { MemberModel } from "../../model/member.model";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";

@Injectable({
  providedIn: "root",
})
export class GroupsService {
  private readonly sortSource = new BehaviorSubject<GroupSortEnum>(
    GroupSortEnum.OLDEST,
  );
  private readonly _currentSort = this.sortSource.asObservable();

  get currentSort() {
    return this._currentSort;
  }

  changeSort(sort: GroupSortEnum) {
    this.sortSource.next(sort);
  }

  sortGroups(groups: GroupModel[]) {
    switch (this.sortSource.getValue()) {
      case GroupSortEnum.OLDEST:
        console.debug("Sorting by oldest");
        groups = this.sortGroupsByCreatedDate(groups, true);
        break;
      case GroupSortEnum.NEWEST:
        console.debug("Sorting by newest");
        groups = this.sortGroupsByCreatedDate(groups, false);
        break;
      case GroupSortEnum.MOST_MEMBERS:
        console.debug("Sorting by most members");
        groups = this.sortGroupsByCurrentGroupSize(groups, false);
        break;
      case GroupSortEnum.LEAST_MEMBERS:
        console.debug("Sorting by least members");
        groups = this.sortGroupsByCurrentGroupSize(groups, true);
        break;
    }

    return groups;
  }

  private sortGroupsByCreatedDate(groups: GroupModel[], reverse: boolean) {
    return groups.sort((a, b) => {
      const aDate = new Date(a.createdDate);
      const bDate = new Date(b.createdDate);
      const difference = bDate.getTime() - aDate.getTime();
      return reverse ? -difference : difference;
    });
  }

  private sortGroupsByCurrentGroupSize(groups: GroupModel[], reverse: boolean) {
    return groups.sort((a, b) => {
      const order = b.members.length - a.members.length;
      return reverse ? -order : order;
    });
  }

  updateGroup(updatedGroup: GroupModel, groups: GroupModel[]): GroupModel[] {
    if (updatedGroup.status !== GroupStatusEnum.ACTIVE) {
      return groups.filter((group) => group.id !== updatedGroup.id);
    } else {
      return groups.map((group) =>
        group.id === updatedGroup.id
          ? { ...updatedGroup, members: group.members }
          : group,
      );
    }
  }

  addMember(member: MemberModel, group: GroupModel) {
    const isMemberInGroup = group.members.find(
      (memberInGroup) => memberInGroup.id === member.id,
    );
    if (isMemberInGroup) {
      return false;
    } else {
      group.members.push(member);
      return true;
    }
  }

  removeMember(memberId: number, group: GroupModel) {
    console.debug("Current members: ", group.members);
    const index = group.members.findIndex((member) => member.id === memberId);
    if (index !== -1) {
      console.debug("Removing member from group");
      group.members.splice(index, 1);
      return true;
    }
    return false;
  }

  shouldResortAfterSizeChange(): boolean {
    const sortCriteria = this.sortSource.getValue();
    return (
      sortCriteria === GroupSortEnum.MOST_MEMBERS ||
      sortCriteria === GroupSortEnum.LEAST_MEMBERS
    );
  }

  removeGroup(groupId: number, groups: GroupModel[]): boolean {
    const index = groups.findIndex((group) => group.id === groupId);
    if (index !== -1) {
      groups.splice(index, 1);
      return true;
    }
    return false;
  }

  insertGroup(groupToAdd: GroupModel, groups: GroupModel[]) {
    const groupExists = groups.find((group) => group.id === groupToAdd.id);

    if (groupExists) {
      console.debug("Group already exists");
      return false;
    }

    switch (this.sortSource.getValue()) {
      case GroupSortEnum.OLDEST:
        console.debug("pushing group to end of list");
        groups.push(groupToAdd);
        break;
      case GroupSortEnum.NEWEST:
        console.debug("unshifting group to start of list");
        groups.unshift(groupToAdd);
        break;
      case GroupSortEnum.LEAST_MEMBERS: {
        const largerGroupIndex = groups.findIndex(
          (groupInList) =>
            groupInList.members.length > groupToAdd.members.length,
        );
        console.debug("largerGroupIndex: ", largerGroupIndex);
        this.insertUsingIndex(largerGroupIndex, groupToAdd, groups);
        break;
      }
      case GroupSortEnum.MOST_MEMBERS: {
        const smallerGroupIndex = groups.findIndex(
          (groupInList) =>
            groupInList.members.length < groupToAdd.members.length,
        );
        console.debug("smallerGroupIndex: ", smallerGroupIndex);
        this.insertUsingIndex(smallerGroupIndex, groupToAdd, groups);
        break;
      }
      default:
        console.debug("default: pushing group to end of list");
        groups.push(groupToAdd);
        break;
    }
    return true;
  }

  private insertUsingIndex(
    index: number,
    group: GroupModel,
    groups: GroupModel[],
  ) {
    if (index === -1) {
      if (this.sortSource.getValue() === GroupSortEnum.LEAST_MEMBERS) {
        groups.push(group);
      } else {
        groups.unshift(group);
      }
    } else {
      groups.splice(index, 0, group);
    }
  }
}
