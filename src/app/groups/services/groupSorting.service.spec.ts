import { GroupSortingService } from "./groupSorting.service";
import { TestBed } from "@angular/core/testing";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { of, tap } from "rxjs";

describe("GroupSortingService", () => {
  let service: GroupSortingService;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupSortingService],
    });

    service = TestBed.inject(GroupSortingService);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("#sortGroups", () => {
    it("should sort the groups by created date in ascending order (i.e. earlier date first)", () => {
      service.changeSort = GroupSortEnum.OLDEST;

      const groups = [
        { createdDate: new Date("2021-01-03") },
        { createdDate: new Date("2021-01-01") },
        { createdDate: new Date("2021-01-02") },
      ];

      const sortedGroups = service.sortGroups(groups as any);

      expect(sortedGroups as any).toEqual([
        { createdDate: new Date("2021-01-01") },
        { createdDate: new Date("2021-01-02") },
        { createdDate: new Date("2021-01-03") },
      ]);
    });

    it("should sort the groups by created date in descending order (i.e. later date first)", () => {
      service.changeSort = GroupSortEnum.NEWEST;

      const groups = [
        { createdDate: new Date("2021-01-03") },
        { createdDate: new Date("2021-01-01") },
        { createdDate: new Date("2021-01-02") },
      ];

      const sortedGroups = service.sortGroups(groups as any);

      expect(sortedGroups as any).toEqual([
        { createdDate: new Date("2021-01-03") },
        { createdDate: new Date("2021-01-02") },
        { createdDate: new Date("2021-01-01") },
      ]);
    });

    it("should sort the groups by most members", () => {
      service.changeSort = GroupSortEnum.MOST_MEMBERS;

      const groups = [
        { members: [1, 2, 3] },
        { members: [1, 2] },
        { members: [1] },
      ];

      const sortedGroups = service.sortGroups(groups as any);

      expect(sortedGroups as any).toEqual([
        { members: [1, 2, 3] },
        { members: [1, 2] },
        { members: [1] },
      ]);
    });

    it("should sort the groups by least members", () => {
      service.changeSort = GroupSortEnum.LEAST_MEMBERS;

      const groups = [
        { members: [1] },
        { members: [1, 2] },
        { members: [1, 2, 3] },
      ];

      const sortedGroups = service.sortGroups(groups as any);

      expect(sortedGroups as any).toEqual([
        { members: [1] },
        { members: [1, 2] },
        { members: [1, 2, 3] },
      ]);
    });
  });

  describe("#sortMembers", () => {
    it("should sort the members by join date in ascending order (i.e. earlier date first)", () => {
      const members = [
        { joinedDate: new Date("2021-01-03") },
        { joinedDate: new Date("2021-01-01") },
        { joinedDate: new Date("2021-01-02") },
      ];

      const sortedMembers = service.sortMembers(members as any);

      expect(sortedMembers as any).toEqual([
        { joinedDate: new Date("2021-01-01") },
        { joinedDate: new Date("2021-01-02") },
        { joinedDate: new Date("2021-01-03") },
      ]);
    });
  });

  describe("currentSort", () => {
    it("should return the current sort type", () => {
      expect(service.currentSort).toEqual(GroupSortEnum.OLDEST);
    });
  });

  describe("currentSort$", () => {
    it("should allow the sort type to be observed", () => {
      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;

        const sortUpdated = of(GroupSortEnum.NEWEST, GroupSortEnum.OLDEST).pipe(
          tap((sort) => (service.changeSort = sort)),
        );

        expectObservable(service.currentSort$).toBe("(abc)", {
          a: GroupSortEnum.OLDEST, // Initial value set in service
          b: GroupSortEnum.NEWEST,
          c: GroupSortEnum.OLDEST,
        });

        expectObservable(sortUpdated).toBe("(ab|)", {
          a: GroupSortEnum.NEWEST,
          b: GroupSortEnum.OLDEST,
        });
      });
    });
  });

  describe("changeSort", () => {
    it("should allow the sort type to be changed", () => {
      service.changeSort = GroupSortEnum.NEWEST;
      expect(service.currentSort).toEqual(GroupSortEnum.NEWEST);

      service.changeSort = GroupSortEnum.OLDEST;
      expect(service.currentSort).toEqual(GroupSortEnum.OLDEST);
    });
  });

  describe("shouldSortGroupAfterSizeChange", () => {
    it("should return true if the current sort type is most members or least members", () => {
      service.changeSort = GroupSortEnum.MOST_MEMBERS;
      expect(service.shouldSortGroupAfterSizeChange()).toBeTrue();

      service.changeSort = GroupSortEnum.LEAST_MEMBERS;
      expect(service.shouldSortGroupAfterSizeChange()).toBeTrue();
    });

    it("should return false if the current sort type is newest members or oldest members", () => {
      service.changeSort = GroupSortEnum.NEWEST;
      expect(service.shouldSortGroupAfterSizeChange()).toBeFalse();

      service.changeSort = GroupSortEnum.OLDEST;
      expect(service.shouldSortGroupAfterSizeChange()).toBeFalse();
    });
  });
});
