import { AsyncRequestStatusService } from "./asyncRequestStatus.service";
import { TestBed } from "@angular/core/testing";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { Observable } from "rxjs";
import { Event } from "../../model/event";
import { AggregateTypeEnum } from "../../model/enums/aggregateType.enum";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { EventStatusEnum } from "../../model/enums/eventStatus.enum";
import { v4 as uuidv4 } from "uuid";
import { RequestStateEnum } from "../state/RequestStateEnum";

function createMockEvent(): Event {
  return {
    eventId: uuidv4(),
    aggregateId: 1,
    aggregateType: AggregateTypeEnum.GROUP,
    eventType: EventTypeEnum.GROUP_CREATED,
    eventData: {},
    eventStatus: EventStatusEnum.SUCCESSFUL,
    createdDate: Date.now().toString(),

    accept: jasmine.createSpy("accept"),
  };
}

describe("AsyncRequestStatusService", () => {
  let service: AsyncRequestStatusService;
  let testScheduler: TestScheduler;
  let mockEvents: Event[] = [];

  beforeEach(() => {
    for (let i = 0; i < 10; i++) {
      mockEvents.push(createMockEvent());
    }

    TestBed.configureTestingModule({
      providers: [AsyncRequestStatusService],
    });

    service = TestBed.inject(AsyncRequestStatusService);
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("successful async request", () => {
    it("should set the status to EVENT_PROCESSED and return the response when the event stream emits a response event", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable, flush } = helpers;

        const eventStream: Observable<Event> = cold("a---b---c", {
          a: mockEvents[0],
          b: mockEvents[1],
          c: mockEvents[2],
        });

        const statusStream: Observable<RequestStateEnum> = cold("--a-b-c--|", {
          a: RequestStateEnum.INITIALIZING,
          b: RequestStateEnum.REQUESTING,
          c: RequestStateEnum.REQUEST_ACCEPTED,
        });

        const requestId = mockEvents[2].eventId;

        const asyncRequest$ = service.observeRequestCompletion(
          eventStream,
          statusStream,
          requestId,
        );

        expectObservable(asyncRequest$).toBe("--------(a|)", {
          a: mockEvents[2],
        });

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "a-b-c-d-(e|)",
          {
            a: RequestStateEnum.DORMANT,
            b: RequestStateEnum.INITIALIZING,
            c: RequestStateEnum.REQUESTING,
            d: RequestStateEnum.REQUEST_ACCEPTED,
            e: RequestStateEnum.EVENT_PROCESSED,
          },
        );

        flush();

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "8ms #",
          undefined,
          new Error(`Request with id ${requestId} is not being processed`),
        );
      });
    });

    it("should continue observing for the response event even if the status stream does not complete", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const eventStream: Observable<Event> = cold("a---b---c", {
          a: mockEvents[0],
          b: mockEvents[1],
          c: mockEvents[2],
        });

        const statusStream: Observable<RequestStateEnum> = cold("--a-b-c--", {
          a: RequestStateEnum.INITIALIZING,
          b: RequestStateEnum.REQUESTING,
          c: RequestStateEnum.REQUEST_ACCEPTED,
        });

        const requestId = mockEvents[2].eventId;

        const asyncRequest$ = service.observeRequestCompletion(
          eventStream,
          statusStream,
          requestId,
        );

        expectObservable(asyncRequest$).toBe("--------(a|)", {
          a: mockEvents[2],
        });

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "a-b-c-d-(e|)",
          {
            a: RequestStateEnum.DORMANT,
            b: RequestStateEnum.INITIALIZING,
            c: RequestStateEnum.REQUESTING,
            d: RequestStateEnum.REQUEST_ACCEPTED,
            e: RequestStateEnum.EVENT_PROCESSED,
          },
        );
      });
    });
  });

  describe("unsuccessful async request", () => {
    it("should return an error and set the status if the status stream emits a REQUEST_REJECTED status", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable, flush } = helpers;

        const eventStream: Observable<Event> = cold("a---b---", {
          a: mockEvents[0],
          b: mockEvents[1],
        });

        const statusStream: Observable<RequestStateEnum> = cold("--a-b-c--", {
          a: RequestStateEnum.INITIALIZING,
          b: RequestStateEnum.REQUESTING,
          c: RequestStateEnum.REQUEST_REJECTED,
        });

        const requestId = mockEvents[2].eventId;

        const asyncRequest$ = service.observeRequestCompletion(
          eventStream,
          statusStream,
          requestId,
        );

        expectObservable(asyncRequest$).toBe(
          "------#",
          undefined,
          new Error(RequestStateEnum.REQUEST_REJECTED),
        );

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "a-b-c-(d|)",
          {
            a: RequestStateEnum.DORMANT,
            b: RequestStateEnum.INITIALIZING,
            c: RequestStateEnum.REQUESTING,
            d: RequestStateEnum.REQUEST_REJECTED,
          },
        );

        flush();

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "6ms #",
          undefined,
          new Error(`Request with id ${requestId} is not being processed`),
        );
      });
    });

    it("should return an error and set the status if the status stream emits a REQUEST_TIMEOUT status", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const eventStream: Observable<Event> = cold("a---b---", {
          a: mockEvents[0],
          b: mockEvents[1],
        });

        const statusStream: Observable<RequestStateEnum> = cold("--a-b-c--", {
          a: RequestStateEnum.INITIALIZING,
          b: RequestStateEnum.REQUESTING,
          c: RequestStateEnum.REQUEST_TIMEOUT,
        });

        const requestId = mockEvents[2].eventId;

        const asyncRequest$ = service.observeRequestCompletion(
          eventStream,
          statusStream,
          requestId,
        );

        expectObservable(asyncRequest$).toBe(
          "------#",
          undefined,
          new Error(RequestStateEnum.REQUEST_TIMEOUT),
        );

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "a-b-c-(d|)",
          {
            a: RequestStateEnum.DORMANT,
            b: RequestStateEnum.INITIALIZING,
            c: RequestStateEnum.REQUESTING,
            d: RequestStateEnum.REQUEST_TIMEOUT,
          },
        );
      });
    });

    it("should return an error and set the status if the event stream does not emit the response event within the timeout", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const eventStream: Observable<Event> = cold("a---b---", {
          a: mockEvents[0],
          b: mockEvents[1],
        });

        const statusStream: Observable<RequestStateEnum> = cold("--a-b-c--", {
          a: RequestStateEnum.INITIALIZING,
          b: RequestStateEnum.REQUESTING,
          c: RequestStateEnum.REQUEST_ACCEPTED,
        });

        const requestId = mockEvents[2].eventId;

        const asyncRequest$ = service.observeRequestCompletion(
          eventStream,
          statusStream,
          requestId,
        );

        expectObservable(asyncRequest$).toBe(
          "7s #",
          undefined,
          new Error(RequestStateEnum.EVENT_PROCESSING_TIMEOUT),
        );

        expectObservable(service.getRequestStatus$(requestId)).toBe(
          "a-b-c-d 6993ms (e|)",
          {
            a: RequestStateEnum.DORMANT,
            b: RequestStateEnum.INITIALIZING,
            c: RequestStateEnum.REQUESTING,
            d: RequestStateEnum.REQUEST_ACCEPTED,
            e: RequestStateEnum.EVENT_PROCESSING_TIMEOUT,
          },
        );
      });
    });
  });
});
