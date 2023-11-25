import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { GroupModel } from "../../model/group.model";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";

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
        console.log("Sorting by oldest");
        groups = this.sortGroupsByCreatedDate(groups, true);
        break;
      case GroupSortEnum.NEWEST:
        console.log("Sorting by newest");
        groups = this.sortGroupsByCreatedDate(groups, false);
        break;
      case GroupSortEnum.MOST_MEMBERS:
        console.log("Sorting by most members");
        groups = this.sortGroupsByCurrentGroupSize(groups, false);
        break;
      case GroupSortEnum.LEAST_MEMBERS:
        console.log("Sorting by least members");
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
      const order = b.currentGroupSize - a.currentGroupSize;
      return reverse ? -order : order;
    });
  }

  updateGroup(
    groupId: number,
    updatedGroupInfo: Partial<GroupModel>,
    groups: GroupModel[],
  ): GroupModel | null {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.status = updatedGroupInfo.status ?? group.status;
      group.lastActive = updatedGroupInfo.lastActive ?? group.lastActive;
      group.currentGroupSize =
        updatedGroupInfo.currentGroupSize ?? group.currentGroupSize;
      return group;
    }
    return null;
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
      console.log("Group already exists");
      return false;
    }

    switch (this.sortSource.getValue()) {
      case GroupSortEnum.OLDEST:
        console.log("pushing group to end of list");
        groups.push(groupToAdd);
        break;
      case GroupSortEnum.NEWEST:
        console.log("unshifting group to start of list");
        groups.unshift(groupToAdd);
        break;
      case GroupSortEnum.LEAST_MEMBERS: {
        const largerGroupIndex = groups.findIndex(
          (groupInList) =>
            groupInList.currentGroupSize > groupToAdd.currentGroupSize,
        );
        console.log("largerGroupIndex: ", largerGroupIndex);
        this.insertUsingIndex(largerGroupIndex, groupToAdd, groups);
        break;
      }
      case GroupSortEnum.MOST_MEMBERS: {
        const smallerGroupIndex = groups.findIndex(
          (groupInList) =>
            groupInList.currentGroupSize < groupToAdd.currentGroupSize,
        );
        console.log("smallerGroupIndex: ", smallerGroupIndex);
        this.insertUsingIndex(smallerGroupIndex, groupToAdd, groups);
        break;
      }
      default:
        console.log("default: pushing group to end of list");
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
