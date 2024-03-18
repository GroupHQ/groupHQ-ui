import { TestBed } from "@angular/core/testing";
import { StateUpdateService } from "./stateUpdate.service";
import { GroupsService } from "./groups.service";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { PublicEventModel } from "../../model/events/publicEvent.model";
import { EventVisitor } from "../../services/notifications/visitors/eventVisitor";
import { StateEnum } from "../../services/state/StateEnum";
import { finalize, of, tap } from "rxjs";

describe("StateUpdateService", () => {
  let service: StateUpdateService;
  let groupService: GroupsService;
  let event: jasmine.SpyObj<PublicEventModel>;
  let visitor: jasmine.SpyObj<EventVisitor>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StateUpdateService],
    });

    service = TestBed.inject(StateUpdateService);
    groupService = TestBed.inject(GroupsService);

    event = jasmine.createSpyObj("PublicEventModel", ["accept"]);
    visitor = jasmine.createSpyObj("EventVisitor", ["visitPublicEvent"]);
  });

  describe("observables", () => {
    let testScheduler: TestScheduler;

    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it("should allow the request and component states to be observed", () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const updateObservable = of(
          StateEnum.LOADING,
          StateEnum.REQUESTING,
        ).pipe(tap((state) => service.handleNewRequestState(state)));

        const eventObservable = cold("5ms |").pipe(
          finalize(() => service.handleEventAndUpdateStates(event, visitor)),
        );

        expectObservable(service.requestState$).toBe("(a b c) d", {
          a: StateEnum.INITIALIZING,
          b: StateEnum.LOADING,
          c: StateEnum.REQUESTING,
          d: StateEnum.READY,
        });

        expectObservable(service.componentState$).toBe("(a) -- b", {
          a: StateEnum.INITIALIZING,
          b: StateEnum.READY,
        });

        expectObservable(updateObservable).toBe("(b c |)", {
          b: StateEnum.LOADING,
          c: StateEnum.REQUESTING,
        });

        expectObservable(eventObservable).toBe("5ms |");
      });
    });
  });

  describe("#handleEventAndUpdateStates", () => {
    it("should set groups to empty array if request state is not ready", () => {
      groupService.groups = [{}, {}] as any;

      service.handleEventAndUpdateStates(event, visitor);

      expect(groupService.groups).toEqual([]);
    });

    it("should set request and component states to ready if request state is not ready", () => {
      service.handleEventAndUpdateStates(event, visitor);

      expect(service.requestState).toEqual(StateEnum.READY);
      expect(service.componentState).toEqual(StateEnum.READY);
    });

    it("should call event.accept with eventVisitor on the given event", () => {
      service.handleEventAndUpdateStates(event, visitor);

      expect(event.accept).toHaveBeenCalledWith(visitor);
    });

    it("should call event.accept with eventVisitor on the given event after setting groups to empty and before updating states", () => {
      groupService.groups = [{}, {}] as any;
      event.accept.and.callFake(() => {
        throw new Error("This error is meant to stop further execution");
      });

      expect(() =>
        service.handleEventAndUpdateStates(event, visitor),
      ).toThrowError("This error is meant to stop further execution");
      expect(groupService.groups).toEqual([]);
      expect(service.requestState).toEqual(StateEnum.INITIALIZING);
      expect(service.componentState).toEqual(StateEnum.INITIALIZING);
    });
  });

  describe("#handleNewRequestState", () => {
    let allStates: StateEnum[];
    beforeEach(() => {
      allStates = [
        StateEnum.INITIALIZING,
        StateEnum.LOADING,
        StateEnum.REQUESTING,
        StateEnum.READY,
        StateEnum.RETRYING,
        StateEnum.DORMANT,
        StateEnum.EVENT_PROCESSED,
        StateEnum.EVENT_PROCESSING_TIMEOUT,
        StateEnum.REQUEST_ACCEPTED,
        StateEnum.REQUEST_COMPLETED,
        StateEnum.REQUEST_REJECTED,
        StateEnum.REQUEST_TIMEOUT,
      ];
    });

    describe("request state behavior", () => {
      it("should set request state to the given state if the given state is not ready", () => {
        allStates.forEach((state) => {
          if (state !== StateEnum.READY) {
            service.handleNewRequestState(state);
            expect(service.requestState).toEqual(state);
          }
        });
      });
    });

    describe("component state behavior", () => {
      it("should not change component state if it's ready", () => {
        service.handleEventAndUpdateStates(event, visitor);
        expect(service.componentState).toEqual(StateEnum.READY);

        allStates.forEach((state) => {
          service.handleNewRequestState(state);
          expect(service.componentState).toEqual(StateEnum.READY);
        });
      });

      it("should set component state to retrying if the request state is retrying", () => {
        service.handleNewRequestState(StateEnum.RETRYING);
        expect(service.componentState).toEqual(StateEnum.RETRYING);
      });

      it("should set component state to loading if it's not initializing", () => {
        service.handleNewRequestState(StateEnum.RETRYING);
        expect(service.componentState).toEqual(StateEnum.RETRYING);

        service.handleNewRequestState(StateEnum.LOADING);
        expect(service.componentState).toEqual(StateEnum.LOADING);
      });

      it("should not set component state to loading if it's currently initializing", () => {
        service.handleNewRequestState(StateEnum.INITIALIZING);
        expect(service.componentState).toEqual(StateEnum.INITIALIZING);

        service.handleNewRequestState(StateEnum.LOADING);
        expect(service.componentState).toEqual(StateEnum.INITIALIZING);
      });
    });
  });
});
