import { Injectable } from "@angular/core";
import { GroupModel } from "../../model/group.model";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { MemberModel } from "../../model/member.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GroupSortingService {
  private readonly _sortSource$ = new BehaviorSubject<GroupSortEnum>(
    GroupSortEnum.OLDEST,
  );

  get currentSort() {
    return this._sortSource$.getValue();
  }

  get currentSort$() {
    return this._sortSource$;
  }

  set changeSort(sort: GroupSortEnum) {
    this._sortSource$.next(sort);
  }

  public sortGroups(groups: GroupModel[]): GroupModel[] {
    switch (this.currentSort) {
      case GroupSortEnum.OLDEST:
        return this.sortGroupsByCreatedDate(groups, true);
      case GroupSortEnum.NEWEST:
        return this.sortGroupsByCreatedDate(groups, false);
      case GroupSortEnum.MOST_MEMBERS:
        return this.sortGroupsByCurrentGroupSize(groups, false);
      case GroupSortEnum.LEAST_MEMBERS:
        return this.sortGroupsByCurrentGroupSize(groups, true);
      default:
        return groups;
    }
  }

  public sortMembers(members: MemberModel[]): MemberModel[] {
    return this.sortMembersByJoinDate(members);
  }

  private sortGroupsByCreatedDate(
    groups: GroupModel[],
    reverse: boolean,
  ): GroupModel[] {
    return groups.sort((a, b) => {
      const aDate = new Date(a.createdDate);
      const bDate = new Date(b.createdDate);
      const difference = bDate.getTime() - aDate.getTime();
      return reverse ? -difference : difference;
    });
  }

  private sortGroupsByCurrentGroupSize(
    groups: GroupModel[],
    reverse: boolean,
  ): GroupModel[] {
    return groups.sort((a, b) => {
      const order = b.members.length - a.members.length;
      return reverse ? -order : order;
    });
  }

  public shouldSortGroupAfterSizeChange(): boolean {
    const sortCriteria = this._sortSource$.getValue();
    return (
      sortCriteria === GroupSortEnum.MOST_MEMBERS ||
      sortCriteria === GroupSortEnum.LEAST_MEMBERS
    );
  }

  private sortMembersByJoinDate(members: MemberModel[]): MemberModel[] {
    return members.sort(
      (a, b) =>
        new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime(),
    );
  }
}
