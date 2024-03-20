import { GroupManagerService } from "./groupManager.service";
import { TestBed } from "@angular/core/testing";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { GroupSortingService } from "./groupSorting.service";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { EventStreamService } from "../../services/notifications/eventStream.service";
import { StateUpdateService } from "./stateUpdate.service";
import { StateEnum } from "../../services/state/StateEnum";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GroupsService } from "./groups.service";
import { EMPTY, of } from "rxjs";
import { FlipService } from "../../services/animation/flip.service";
import { QueryList } from "@angular/core";
import { PublicEventModel } from "../../model/events/publicEvent.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { GroupModel } from "../../model/group.model";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { EventStatusEnum } from "../../model/enums/eventStatus.enum";

describe("GroupManagerService", () => {
  let service: GroupManagerService;
  let eventStreamServiceSpy: jasmine.SpyObj<EventStreamService>;
  let groupService: GroupsService;
  let groupStateService: StateUpdateService;
  let flipService: FlipService;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    eventStreamServiceSpy = jasmine.createSpyObj("EventStreamService", [
      "stream",
      "streamStatus",
      "retryTime",
    ]);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        GroupManagerService,
        {
          provide: EventStreamService,
          useValue: eventStreamServiceSpy,
        },
      ],
    });

    service = TestBed.inject(GroupManagerService);

    groupService = TestBed.inject(GroupsService);
    groupStateService = TestBed.inject(StateUpdateService);
    flipService = TestBed.inject(FlipService);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("exposed members", () => {
    it("exposes observable status updates from the state service", () => {
      expect(service.groupState$).toEqual(groupStateService.requestState$);
    });

    it("exposes the current status from the state service", () => {
      expect(service.groupState).toEqual(groupStateService.requestState);
    });

    it("exposes the current component state observable from the state service", () => {
      expect(service.componentState$).toEqual(
        groupStateService.componentState$,
      );
    });

    it("exposes the current component state from the state service", () => {
      expect(service.componentState).toEqual(groupStateService.componentState);
    });

    it("exposes the current group route", () => {
      eventStreamServiceSpy.stream.and.returnValue(EMPTY);
      eventStreamServiceSpy.streamStatus.and.returnValue(EMPTY);

      service.subscribeToGroupsStream("testRoute");

      expect(service.currentGroupRoute).toEqual("testRoute");
    });

    it("exposes the current groups observable from group service", () => {
      expect(service.groups$).toEqual(groupService.groups$);
    });

    it("exposes the current groups from group service", () => {
      expect(service.groups).toEqual(groupService.groups);
    });
  });

  describe("event status updates", () => {
    it("delegates status updates to group state service", () => {
      spyOn(groupStateService, "handleNewRequestState").and.callThrough();
      const statusUpdates = [
        StateEnum.INITIALIZING,
        StateEnum.LOADING,
        StateEnum.REQUESTING,
        StateEnum.READY,
      ];

      testScheduler.run(({ cold, flush }) => {
        const streamStatusUpdates = cold("a - b - c - d", {
          a: statusUpdates[0],
          b: statusUpdates[1],
          c: statusUpdates[2],
          d: statusUpdates[3],
        });

        eventStreamServiceSpy.stream.and.returnValue(cold("-"));
        eventStreamServiceSpy.streamStatus.and.returnValue(streamStatusUpdates);

        service.subscribeToGroupsStream("testRoute");

        flush();

        for (const status of statusUpdates) {
          expect(groupStateService.handleNewRequestState).toHaveBeenCalledWith(
            status,
          );
        }
      });
    });
  });

  describe("event handling updates", () => {
    let groupIdCounter = 0;

    function createGroup(status: GroupStatusEnum, id?: number): GroupModel {
      return {
        id: id ?? ++groupIdCounter,
        title: "Group 1",
        description: "Group 1 description",
        maxGroupSize: 10,
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        createdBy: "Test User 1",
        lastModifiedBy: "Test User 1",
        version: 1,
        status,
        members: [],
      };
    }

    function createEvent(
      eventType: EventTypeEnum,
      eventStatus: EventStatusEnum,
      eventData: any,
      eventAggregateId?: number,
    ): Partial<PublicEventModel> {
      return {
        eventType,
        eventStatus,
        eventData,
        aggregateId: eventAggregateId ?? 0,
      };
    }

    function runEvents(events: Partial<PublicEventModel>[]) {
      testScheduler.run(({ cold, flush }) => {
        let marbles = "";
        const values: { [key: string]: Partial<PublicEventModel> } = {};

        events.forEach((event, index) => {
          const key = String.fromCharCode(97 + index); // ASCII 'a' starts at 97
          marbles += key;
          values[key] = event;
        });

        console.debug("Observable info", marbles, values);
        const events$ = cold(`(${marbles})`, values);

        eventStreamServiceSpy.stream.and.returnValue(events$);
        eventStreamServiceSpy.streamStatus.and.returnValue(EMPTY);

        service.subscribeToGroupsStream("testRoute");

        flush();
      });
    }

    it("handles events", () => {
      const group = createGroup(GroupStatusEnum.ACTIVE);
      const eventA = createEvent(
        EventTypeEnum.GROUP_CREATED,
        EventStatusEnum.SUCCESSFUL,
        group,
      );

      runEvents([eventA]);

      spyOn(flipService, "animate").and.callThrough();

      expect(groupService.groups).toContain(group);
      expect(flipService.animate).toHaveBeenCalledTimes(0);
    });

    it("calls flip service to animate the change when the component state is ready (currently after the first event emitted)", () => {
      const eventA = createEvent(
        EventTypeEnum.GROUP_CREATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.ACTIVE),
      );
      const eventB = createEvent(
        EventTypeEnum.GROUP_UPDATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.ACTIVE),
      );

      spyOn(flipService, "animate").and.callThrough();
      runEvents([eventA, eventB]);

      expect(service.groups.length).toBe(2);
      expect(flipService.animate).toHaveBeenCalledTimes(1);
    });

    it("calls flip service to animate a group removal when the event type is GROUP_UPDATED and group status is not active", () => {
      const addEvent = createEvent(
        EventTypeEnum.GROUP_CREATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.ACTIVE, 1),
      );
      const removeEvent = createEvent(
        EventTypeEnum.GROUP_UPDATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.DISBANDED, 1),
        1,
      );

      spyOn(flipService, "animateRemoval").and.callThrough();

      runEvents([addEvent, removeEvent]);

      expect(service.groups.length).toBe(0);
      expect(flipService.animateRemoval).toHaveBeenCalledTimes(1); // 1 because first event is not animated
    });

    it("performs the change without animation if flip service throws an error", () => {
      const eventA = createEvent(
        EventTypeEnum.GROUP_CREATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.ACTIVE),
      );
      const eventB = createEvent(
        EventTypeEnum.GROUP_UPDATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.ACTIVE),
      );

      spyOn(flipService, "animate").and.throwError("Test error");
      runEvents([eventA, eventB]);

      expect(service.groups.length).toBe(2);
      expect(flipService.animate).toThrowError("Test error");
    });

    it("performs the change without calling flip service if the component state is not ready", () => {
      const eventA = createEvent(
        EventTypeEnum.GROUP_CREATED,
        EventStatusEnum.SUCCESSFUL,
        createGroup(GroupStatusEnum.ACTIVE),
      );

      spyOn(flipService, "animate").and.callThrough();
      runEvents([eventA]);

      expect(service.groups.length).toBe(1);
      expect(flipService.animate).toHaveBeenCalledTimes(0);
    });
  });

  describe("stream retry time", () => {
    it("exposes the current stream retry time if the current route is set", () => {
      eventStreamServiceSpy.stream.and.returnValue(EMPTY);
      eventStreamServiceSpy.streamStatus.and.returnValue(EMPTY);

      service.subscribeToGroupsStream("testRoute");

      const mockRetryTime = of(1000);
      eventStreamServiceSpy.retryTime.and.returnValue(mockRetryTime);
      expect(service.streamRetryTime).toEqual(mockRetryTime);
    });

    it("should throw an error if the current route is not set", () => {
      expect(() => service.streamRetryTime).toThrowError();
    });
  });

  describe("sort handling updates", () => {
    it("should sort the groups when the sort type changes", () => {
      const groupSortingService = TestBed.inject(GroupSortingService);

      spyOn(groupSortingService, "sortGroups").and.callThrough();

      groupSortingService.changeSort = GroupSortEnum.NEWEST;

      expect(groupSortingService.sortGroups).toHaveBeenCalled();
    });
  });

  describe("#setCardComponents", () => {
    it("should set the card components on FlipService", () => {
      spyOn(flipService, "setComponents").and.callThrough();

      expect(() =>
        service.setCardComponents(new QueryList<any>(), null as any),
      ).not.toThrowError();
      expect(flipService.setComponents).toHaveBeenCalledOnceWith(
        jasmine.any(QueryList),
      );
    });
  });
});
