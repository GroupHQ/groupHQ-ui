import { TestBed } from "@angular/core/testing";
import { GroupsService } from "./groups.service";
import { GroupModel } from "../../model/group.model";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { MemberModel } from "../../model/member.model";
import { MemberStatusEnum } from "../../model/enums/memberStatus.enum";

describe("GroupsService", () => {
  let service: GroupsService;
  let groups: GroupModel[] = [];
  const date = new Date(99, 0, 1, 0, 0, 0);
  const groupDates = [
    new Date(date.getTime() - 3000).toString(),
    new Date(date.getTime() - 2000).toString(),
    new Date(date.getTime() - 1000).toString(),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupsService],
    });
    service = TestBed.inject(GroupsService);

    groups = [
      {
        id: 1,
        title: "Group 1",
        description: "Group 1 description",
        status: GroupStatusEnum.ACTIVE,
        maxGroupSize: 10,
        lastModifiedDate: groupDates[0],
        lastModifiedBy: "Test User 1",
        createdDate: groupDates[0],
        createdBy: "Test User 1",
        version: 1,
        members: [
          new MemberModel(
            1,
            "Test User 1",
            1,
            MemberStatusEnum.ACTIVE,
            new Date().toString(),
            null,
          ),
        ],
      },
      {
        id: 2,
        title: "Group 2",
        description: "Group 2 description",
        status: GroupStatusEnum.ACTIVE,
        maxGroupSize: 10,
        lastModifiedDate: groupDates[1],
        lastModifiedBy: "Test User 2",
        createdDate: groupDates[1],
        createdBy: "Test User 2",
        version: 1,
        members: [
          new MemberModel(
            2,
            "Test User 2",
            2,
            MemberStatusEnum.ACTIVE,
            new Date().toString(),
            null,
          ),
          new MemberModel(
            3,
            "Test User 3",
            2,
            MemberStatusEnum.ACTIVE,
            new Date().toString(),
            null,
          ),
          new MemberModel(
            4,
            "Test User 4",
            2,
            MemberStatusEnum.ACTIVE,
            new Date().toString(),
            null,
          ),
        ],
      },
    ];
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("#changeSort", () => {
    it("should change the sortSource value", (done) => {
      const expectedSorts = [
        GroupSortEnum.OLDEST,
        GroupSortEnum.NEWEST,
        GroupSortEnum.OLDEST,
      ];
      const actualSorts: GroupSortEnum[] = [];

      const subscription = service.currentSort.subscribe((sort) => {
        actualSorts.push(sort);

        if (actualSorts.length === expectedSorts.length) {
          expect(actualSorts).toEqual(expectedSorts);
          subscription.unsubscribe();
          done();
        }
      });

      service.changeSort(GroupSortEnum.NEWEST);
      service.changeSort(GroupSortEnum.OLDEST);
    });
  });

  describe("#sortGroups", () => {
    it("should sort groups by created date ascending", () => {
      service.changeSort(GroupSortEnum.OLDEST);
      service.sortGroups(groups);

      expect(groups[0].id).toBe(1);
      expect(groups[1].id).toBe(2);
    });

    it("should sort groups by created date descending", () => {
      service.changeSort(GroupSortEnum.NEWEST);
      service.sortGroups(groups);

      expect(groups[0].id).toBe(2);
      expect(groups[1].id).toBe(1);
    });

    it("should sort groups by current size ascending", () => {
      service.changeSort(GroupSortEnum.LEAST_MEMBERS);
      service.sortGroups(groups);

      expect(groups[0].id).toBe(1);
      expect(groups[1].id).toBe(2);
    });

    it("should sort groups by current size descending", () => {
      service.changeSort(GroupSortEnum.MOST_MEMBERS);
      service.sortGroups(groups);

      expect(groups[0].id).toBe(2);
      expect(groups[1].id).toBe(1);
    });
  });

  describe("#updateGroup", () => {
    it("should remove the group when its status becomes non-active", () => {
      const updatedGroup: GroupModel = {
        id: 1,
        title: "Group 1",
        description: "Group 1 description",
        status: GroupStatusEnum.AUTO_DISBANDED,
        maxGroupSize: 10,
        lastModifiedDate: new Date().toString(),
        lastModifiedBy: "Test User 1",
        createdDate: groupDates[0],
        createdBy: "Test User 1",
        version: 2,
        members: [],
      };
      service.updateGroup(updatedGroup, groups);

      expect(groups).not.toContain(updatedGroup);
    });

    it("should update group lastActive", () => {
      const updatedGroup: GroupModel = {
        id: 1,
        title: "Group 1",
        description: "Group 1 description",
        status: GroupStatusEnum.ACTIVE,
        maxGroupSize: 10,
        lastModifiedDate: new Date().toString(),
        lastModifiedBy: "Test User 1",
        createdDate: groupDates[0],
        createdBy: "Test User 1",
        version: 2,
        members: [],
      };
      groups = service.updateGroup(updatedGroup, groups);

      expect(groups[0].lastModifiedDate).toBe(updatedGroup.lastModifiedDate);
    });

    it("should update group currentGroupSize", () => {
      const member: MemberModel = {
        id: 1,
        username: "Test User 1",
        groupId: 1,
        memberStatus: MemberStatusEnum.ACTIVE,
        joinedDate: new Date().toString(),
        exitedDate: null,
      };
      service.addMember(member, groups[0]);

      expect(groups[0].members.length).toBe(1);
    });
  });

  describe("#shouldResortAfterSizeChange", () => {
    it("should return true when sort is LEAST_MEMBERS", () => {
      service.changeSort(GroupSortEnum.LEAST_MEMBERS);
      expect(service.shouldResortAfterSizeChange()).toBe(true);
    });

    it("should return true when sort is MOST_MEMBERS", () => {
      service.changeSort(GroupSortEnum.MOST_MEMBERS);
      expect(service.shouldResortAfterSizeChange()).toBe(true);
    });

    it("should return false when sort is OLDEST", () => {
      service.changeSort(GroupSortEnum.OLDEST);
      expect(service.shouldResortAfterSizeChange()).toBe(false);
    });

    it("should return false when sort is NEWEST", () => {
      service.changeSort(GroupSortEnum.NEWEST);
      expect(service.shouldResortAfterSizeChange()).toBe(false);
    });

    it("should return false when sort is invalid", () => {
      service.changeSort("INVALID" as GroupSortEnum);
      expect(service.shouldResortAfterSizeChange()).toBe(false);
    });
  });

  describe("#removeGroup", () => {
    it("should remove group from list", () => {
      service.removeGroup(groups[0].id, groups);

      expect(groups.length).toBe(1);
      expect(groups.map((group) => group.id)).toEqual([2]);
    });

    it("should not remove group from list when group does not exist", () => {
      service.removeGroup(3, groups);

      expect(groups.length).toBe(2);
      expect(groups.map((group) => group.id)).toEqual([1, 2]);
    });
  });

  describe("#insertGroup", () => {
    let group: GroupModel;
    beforeEach(() => {
      group = {
        id: 3,
        title: "Group 3",
        description: "Group 3 description",
        status: GroupStatusEnum.ACTIVE,
        maxGroupSize: 10,
        lastModifiedDate: new Date().toString(),
        lastModifiedBy: "Test User 3",
        createdDate: new Date().toString(),
        createdBy: "Test User 3",
        version: 1,
        members: [
          new MemberModel(
            5,
            "Test User 5",
            3,
            MemberStatusEnum.ACTIVE,
            new Date().toString(),
            null,
          ),
          new MemberModel(
            6,
            "Test User 6",
            3,
            MemberStatusEnum.ACTIVE,
            new Date().toString(),
            null,
          ),
        ],
      };
    });

    it("should only insert group at end of list when sort is OLDEST", () => {
      service.changeSort(GroupSortEnum.OLDEST);
      service.sortGroups(groups);
      service.insertGroup(group, groups);

      expect(groups.length).toBe(3);
      expect(groups.map((group) => group.id)).toEqual([1, 2, 3]);
    });

    it("should only insert group at start of list when sort is NEWEST", () => {
      service.changeSort(GroupSortEnum.NEWEST);
      service.sortGroups(groups);
      service.insertGroup(group, groups);

      expect(groups.length).toBe(3);
      expect(groups.map((group) => group.id)).toEqual([3, 2, 1]);
    });

    it("should only insert group at correct index when sort is LEAST_MEMBERS", () => {
      service.changeSort(GroupSortEnum.LEAST_MEMBERS);
      service.sortGroups(groups);
      service.insertGroup(group, groups);

      expect(groups.length).toBe(3);
      expect(groups.map((group) => group.id)).toEqual([1, 3, 2]);
    });

    it("should only insert group at correct index when sort is MOST_MEMBERS", () => {
      service.changeSort(GroupSortEnum.MOST_MEMBERS);
      service.sortGroups(groups);
      group.maxGroupSize = 15;
      service.insertGroup(group, groups);

      expect(groups.length).toBe(3);
      expect(groups.map((group) => group.id)).toEqual([2, 3, 1]);
    });

    it("should only insert group at end of list when sort is invalid", () => {
      service.changeSort("INVALID" as GroupSortEnum);
      service.sortGroups(groups);
      service.insertGroup(group, groups);

      expect(groups.length).toBe(3);
      expect(groups.map((group) => group.id)).toEqual([1, 2, 3]);
    });

    it("should only not insert group when group already exists", () => {
      service.changeSort(GroupSortEnum.OLDEST);
      service.sortGroups(groups);
      service.insertGroup(groups[0], groups);

      expect(groups.length).toBe(2);
      expect(groups.map((group) => group.id)).toEqual([1, 2]);
    });
  });
});
