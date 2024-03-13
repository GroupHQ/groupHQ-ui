import { EventStreamService } from "./eventStream.service";
import { TestBed } from "@angular/core/testing";
import { RsocketRequestMediatorFactory } from "../network/rsocket/mediators/rsocketRequestMediator.factory";
import { RequestServiceComponentInterface } from "../network/rsocket/mediators/interfaces/requestServiceComponent.interface";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { EMPTY, of } from "rxjs";
import { ConfigService } from "../../config/config.service";
import { RequestStateEnum } from "../state/RequestStateEnum";

describe("EventStreamService", () => {
  let service: EventStreamService;
  let rsocketRequestFactory: RsocketRequestMediatorFactory;
  let rsocketServiceComponentInterface: RequestServiceComponentInterface<any>;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventStreamService,
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    });

    service = TestBed.inject(EventStreamService);
    rsocketRequestFactory = TestBed.inject(RsocketRequestMediatorFactory);
    rsocketServiceComponentInterface =
      rsocketRequestFactory.createStreamMediator("route");

    spyOn(rsocketRequestFactory, "createStreamMediator").and.returnValue(
      rsocketServiceComponentInterface,
    );

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    spyOn(rsocketServiceComponentInterface, "getEvents$").and.returnValue(
      of(EMPTY),
    );
  });

  describe("#stream", () => {
    it("should return the same stream if it has already been created", () => {
      const streamObservableA = service.stream("route");
      const streamObservableB = service.stream("route");

      expect(streamObservableA).toBe(streamObservableB);
    });
  });

  describe("#streamStatus", () => {
    it("should return the status of an existing stream with the given route", () => {
      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;

        service.stream("route");
        const streamStatusObservable = service.streamStatus("route");

        expectObservable(streamStatusObservable).toBe("a", {
          a: RequestStateEnum.INITIALIZING,
        });
      });
    });

    it("should throw an error if there is no stream with the given route", () => {
      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;

        const streamStatusObservable = service.streamStatus("nonTrackedStream");

        expectObservable(streamStatusObservable).toBe(
          "#",
          null,
          new Error("No stream status for response route: nonTrackedStream"),
        );
      });
    });
  });
});
