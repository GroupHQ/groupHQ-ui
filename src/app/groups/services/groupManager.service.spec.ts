import { TestBed } from "@angular/core/testing";
import { GroupModel } from "../../model/group.model";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { GroupManagerService, GroupUpdate } from "./groupManager.service";
import { GroupsService } from "./groups.service";
import { PublicEventModel } from "../../model/publicEvent.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";

describe("GroupManagerService", () => {
  let service: GroupManagerService;
  let groups: GroupModel[] = [];
  const date = new Date(99, 0, 1, 0, 0, 0);
  const groupDates = [
    new Date(date.getTime() + 1000).toString(),
    new Date(date.getTime() + 2000).toString(),
    new Date(date.getTime() + 3000).toString(),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupManagerService, GroupsService],
    });
    service = TestBed.inject(GroupManagerService);

    groups = [
      {
        id: 1,
        title: "Group 1",
        description: "Group 1 description",
        status: "ACTIVE",
        currentGroupSize: 5,
        maxGroupSize: 10,
        lastActive: groupDates[0],
        lastModifiedDate: groupDates[0],
        lastModifiedBy: "Test User 1",
        createdDate: groupDates[0],
        createdBy: "Test User 1",
        version: 1,
      },
      {
        id: 2,
        title: "Group 2",
        description: "Group 2 description",
        status: "ACTIVE",
        currentGroupSize: 9,
        maxGroupSize: 10,
        lastActive: groupDates[1],
        lastModifiedDate: groupDates[1],
        lastModifiedBy: "Test User 2",
        createdDate: groupDates[1],
        createdBy: "Test User 2",
        version: 1,
      },
    ];
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("#handleUpdates", () => {
    function assertGroupUpdate(assertions: () => void) {
      const subscription = service.groupUpdateActions$.subscribe(
        (groupUpdate: GroupUpdate) => {
          groupUpdate.updateFunction();
          assertions();
          subscription.unsubscribe();
        },
      );
    }

    it("should add a group when a group created event is received", () => {
      const group: GroupModel = {
        id: 3,
        title: "Group 3",
        description: "Group 3 description",
        status: "ACTIVE",
        currentGroupSize: 9,
        maxGroupSize: 10,
        lastActive: groupDates[2],
        lastModifiedDate: groupDates[2],
        lastModifiedBy: "Test User 3",
        createdDate: groupDates[2],
        createdBy: "Test User 3",
        version: 1,
      };
      const event = {
        eventType: EventTypeEnum.GROUP_CREATED,
        aggregateId: group.id,
        eventData: JSON.stringify(group),
      } as PublicEventModel;

      assertGroupUpdate(() => expect(service.groups).toContain(group));

      service.handleUpdates(event);
    });

    it("should remove a group if group status changes from 'ACTIVE'", () => {
      const group = groups[0];

      const groupUpdates: Partial<GroupModel> = {
        status: GroupStatusEnum.AUTO_DISBANDED,
      };
      const event = {
        eventType: EventTypeEnum.GROUP_STATUS_UPDATED,
        aggregateId: group.id,
        eventData: JSON.stringify(groupUpdates),
      } as PublicEventModel;

      assertGroupUpdate(() =>
        expect(service.groups.map((group) => group.id)).not.toContain(group.id),
      );

      service.handleUpdates(event);
    });

    it("should update the group size when a MEMBER_JOINED event is received", () => {
      const group = groups[0];

      const event = {
        eventType: EventTypeEnum.MEMBER_JOINED,
        aggregateId: group.id,
        eventData: JSON.stringify({}),
      } as PublicEventModel;

      assertGroupUpdate(() =>
        expect(service.groups[0].currentGroupSize).toBe(
          group.currentGroupSize + 1,
        ),
      );

      service.handleUpdates(event);
    });

    it("should update the group size when a MEMBER_LEFT event is received", () => {
      const group = groups[0];

      const event = {
        eventType: EventTypeEnum.MEMBER_LEFT,
        aggregateId: group.id,
        eventData: JSON.stringify({}),
      } as PublicEventModel;

      assertGroupUpdate(() =>
        expect(service.groups[0].currentGroupSize).toBe(
          group.currentGroupSize - 1,
        ),
      );

      service.handleUpdates(event);
    });

    describe("group integrity", () => {
      function assertIntegrity(eventType: EventTypeEnum) {
        const groupsCopy = [...groups];
        const event = {
          eventType: eventType,
          aggregateId: Number.MAX_VALUE,
          eventData: JSON.stringify({}),
        } as PublicEventModel;

        assertGroupUpdate(() => expect(service.groups).toEqual(groupsCopy));

        service.handleUpdates(event);
      }

      it("does not change groups if group is invalid for GROUP_CREATED event", () => {
        assertIntegrity(EventTypeEnum.GROUP_CREATED);
      });

      it("does not change groups if group doesn't exist for GROUP_STATUS_UPDATED event", () => {
        assertIntegrity(EventTypeEnum.GROUP_STATUS_UPDATED);
      });

      it("does not change groups if group doesn't exist for MEMBER_JOINED event", () => {
        assertIntegrity(EventTypeEnum.MEMBER_JOINED);
      });

      it("does not change groups if group doesn't exist for MEMBER_LEFT event", () => {
        assertIntegrity(EventTypeEnum.MEMBER_LEFT);
      });
    });
  });
});
