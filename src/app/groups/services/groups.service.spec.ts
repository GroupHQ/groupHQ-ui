import { GroupsService } from "./groups.service";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { TestBed } from "@angular/core/testing";
import { of, tap } from "rxjs";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { GroupModel } from "../../model/group.model";
import { GroupSortingService } from "./groupSorting.service";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { MemberModel } from "../../model/member.model";

let groupIdCounter = 0;

function createGroup(members?: MemberModel[], other?: Partial<GroupModel>) {
  const group: Partial<GroupModel> = {
    id: ++groupIdCounter,
    status: GroupStatusEnum.ACTIVE,
    members: members ?? [],
    ...other,
  };

  return group as any;
}

function createMembers(count: number) {
  return Array.from(
    { length: count },
    (_, i): Partial<MemberModel> => ({ id: i + 1 }),
  ) as any;
}

describe("GroupsService", () => {
  let service: GroupsService;
  let groupSortingService: GroupSortingService;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    groupIdCounter = 0;

    TestBed.configureTestingModule({
      providers: [GroupsService],
    });

    service = TestBed.inject(GroupsService);
    groupSortingService = TestBed.inject(GroupSortingService);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("get #groups", () => {
    it("should return the current groups", () => {
      expect(service.groups).toEqual([]);
    });
  });

  describe("set #groups", () => {
    it("should set the groups", () => {
      const group = createGroup();
      service.groups = [group];

      expect(service.groups).toEqual([group] as any);
    });
  });

  describe("get #groups$", () => {
    it("should allow the current groups to be observed", () => {
      const groups = [createGroup(), createGroup()];

      testScheduler.run(({ expectObservable }) => {
        expectObservable(service.groups$).toBe("(abc)", {
          a: [],
          b: [groups[0]],
          c: [groups[1]],
        });

        const groupsToEmit = of([groups[0]], [groups[1]]).pipe(
          tap((groups) => (service.groups = groups)),
        );

        expectObservable(groupsToEmit).toBe("(ab|)", {
          a: [groups[0]],
          b: [groups[1]],
        });
      });
    });
  });

  describe("#handleGroupUpdate", () => {
    it("should add a group if it doesn't exist and sort its members", () => {
      const group = createGroup();

      spyOn(groupSortingService, "sortMembers").and.returnValue([]);

      service.handleGroupUpdate(group);

      expect(service.groups).toEqual([group]);
      expect(groupSortingService.sortMembers).toHaveBeenCalledOnceWith([]);
    });

    it("should replace a group if it exists", () => {
      let group = createGroup([], { title: "Old Title" });

      service.handleGroupUpdate(group);

      group = { ...group, title: "New Title" };

      service.handleGroupUpdate(group);

      expect(service.groups).toEqual([group]);
    });

    it("should remove a group if it is not active", () => {
      let group = createGroup();

      service.handleGroupUpdate(group);

      group = { ...group, status: GroupStatusEnum.AUTO_DISBANDED };

      service.handleGroupUpdate(group);

      expect(service.groups).toEqual([]);
    });

    describe("when the sort type is OLDEST or unrecognized", () => {
      it("should add the group to the end of the list", () => {
        const sortTypes: GroupSortEnum[] = [
          GroupSortEnum.OLDEST,
          "UNKNOWN" as GroupSortEnum,
        ];

        for (const sortType of sortTypes) {
          groupSortingService.changeSort = sortType;

          service.groups = [createGroup(), createGroup()];

          const group = createGroup();

          service.handleGroupUpdate(group);

          expect(service.groups.length).toEqual(3);
          expect(service.groups[2]).toEqual(group);
        }
      });
    });

    describe("when the sort type is NEWEST", () => {
      it("should add the group to the beginning of the list", () => {
        groupSortingService.changeSort = GroupSortEnum.NEWEST;

        service.groups = [createGroup(), createGroup()];

        const group = createGroup();

        service.handleGroupUpdate(group);

        expect(service.groups.length).toEqual(3);
        expect(service.groups[0]).toEqual(group);
      });
    });

    describe("when the sort type is MOST_MEMBERS", () => {
      beforeEach(() => {
        groupSortingService.changeSort = GroupSortEnum.MOST_MEMBERS;
      });

      it("should add the group before the first group with less members than it", () => {
        service.groups = [
          createGroup(createMembers(3)),
          createGroup(createMembers(1)),
        ];

        const group = createGroup(createMembers(2));

        service.handleGroupUpdate(group);

        expect(service.groups.length).toEqual(3);
        expect(service.groups[1]).toEqual(group);
      });

      it("should add the group to the end of the list if no other group has less members than it", () => {
        service.groups = [
          createGroup(createMembers(3)),
          createGroup(createMembers(2)),
        ];

        const group = createGroup(createMembers(1));

        service.handleGroupUpdate(group);

        expect(service.groups.length).toEqual(3);
        expect(service.groups[2]).toEqual(group);
      });
    });

    describe("when the sort type is LEAST_MEMBERS", () => {
      beforeEach(() => {
        groupSortingService.changeSort = GroupSortEnum.LEAST_MEMBERS;
      });

      it("should add the group before the first group with more members than it", () => {
        service.groups = [
          createGroup(createMembers(1)),
          createGroup(createMembers(3)),
        ];

        const group = createGroup(createMembers(2));

        service.handleGroupUpdate(group);

        expect(service.groups.length).toEqual(3);
        expect(service.groups[1]).toEqual(group);
      });

      it("should add the group to the end of the list if no other group has more members than it", () => {
        service.groups = [
          createGroup(createMembers(1)),
          createGroup(createMembers(2)),
        ];

        const group = createGroup(createMembers(3));

        service.handleGroupUpdate(group);

        expect(service.groups.length).toEqual(3);
        expect(service.groups[2]).toEqual(group);
      });
    });

    describe("adding a member", () => {
      it("should add a member to the group", () => {
        const members = createMembers(2);

        service.groups = [createGroup([]), createGroup(members)];

        service.addMember(members[1], 2);

        expect(service.groups[1].members).toEqual(members);
      });

      it("should not add a member if the group does not exist", () => {
        const members = createMembers(2);

        const groups = [createGroup([]), createGroup(members[0])];

        service.groups = groups;

        service.addMember(members[1], 3);

        expect(groups.length).toEqual(2);

        for (let i = 0; i < groups.length; i++) {
          expect(service.groups[i].members).toEqual(groups[i].members);
        }
      });

      it("should not add a member if the member is already in the group", () => {
        const members = createMembers(2);

        service.groups = [createGroup([members[0]]), createGroup([members[1]])];

        service.addMember(members[0], 1);

        expect(service.groups[0].members).toEqual([members[0]]);
      });

      it("should sort the groups after adding a member if the sort type is MOST_MEMBERS or LEAST_MEMBERS", () => {
        const sortTypes: GroupSortEnum[] = [
          GroupSortEnum.MOST_MEMBERS,
          GroupSortEnum.LEAST_MEMBERS,
        ];

        spyOn(groupSortingService, "sortGroups");

        for (const sortType of sortTypes) {
          groupSortingService.changeSort = sortType;

          const member = createMembers(1)[0];
          service.groups = [createGroup()];

          service.addMember(member, groupIdCounter);
        }

        expect(groupSortingService.sortGroups).toHaveBeenCalledTimes(2);
      });
    });

    describe("removing a member", () => {
      it("should remove a member from the group", () => {
        const members = createMembers(2);

        service.groups = [createGroup(members), createGroup([members[0]])];

        service.removeMember(members[1].id, 1);

        expect(service.groups[0].members).toEqual([members[0]]);
      });

      it("should not remove a member if the group does not exist", () => {
        const members = createMembers(2);

        const groups = [createGroup(members), createGroup(members[0])];

        service.groups = groups;

        service.removeMember(members[1].id, 3);

        for (let i = 0; i < groups.length; i++) {
          expect(service.groups[i].members).toEqual(groups[i].members);
        }
      });

      it("should not remove a member if the member is not in the group", () => {
        const members = createMembers(2);

        service.groups = [createGroup([members[0]]), createGroup([members[0]])];

        service.removeMember(members[1].id, 1);

        expect(service.groups[0].members).toEqual([members[0]]);
        expect(service.groups[1].members).toEqual([members[0]]);
      });

      it("should sort the groups after removing a member if the sort type is MOST_MEMBERS or LEAST_MEMBERS", () => {
        const sortTypes: GroupSortEnum[] = [
          GroupSortEnum.MOST_MEMBERS,
          GroupSortEnum.LEAST_MEMBERS,
        ];

        spyOn(groupSortingService, "sortGroups");

        for (const sortType of sortTypes) {
          groupSortingService.changeSort = sortType;

          const member = createMembers(1);
          service.groups = [createGroup(member)];

          service.removeMember(member[0].id, groupIdCounter);
        }

        expect(groupSortingService.sortGroups).toHaveBeenCalledTimes(2);
      });
    });
  });
});
