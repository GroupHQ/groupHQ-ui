import { AbstractRsocketRequestMediator } from "./abstractRsocketRequest.mediator";
import { ConfigService } from "../../../../config/config.service";
import { TestBed } from "@angular/core/testing";
import { RsocketService } from "../rsocket.service";
import { RetryService } from "../../../retry/retry.service";
import { UserService } from "../../../user/user.service";
import { RsocketRequestFactory } from "../rsocketRequest.factory";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { StateEnum } from "../../../state/StateEnum";

class MockRsocketRequestMediator extends AbstractRsocketRequestMediator<
  any,
  any
> {
  public sendRequest(): void {
    throw new Error("Method not implemented.");
  }
}

describe("AbstractRsocketRequestMediator", () => {
  let service: MockRsocketRequestMediator;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    });

    service = new MockRsocketRequestMediator(
      TestBed.inject(RsocketService),
      TestBed.inject(RsocketRequestFactory),
      TestBed.inject(RetryService),
      TestBed.inject(UserService),
      TestBed.inject(ConfigService),
      "route",
      null,
    );

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("#completeEvents", () => {
    it("completes the events and request states observables", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const eventEmitter$ = cold("- a b c", {
          a: "1",
          b: "2",
          c: "3",
        });

        eventEmitter$.subscribe((event) => service.nextEvent(event));

        const statusEmitter$ = cold("- a b c", {
          a: StateEnum.REQUESTING,
          b: StateEnum.READY,
          c: StateEnum.RETRYING,
        });

        statusEmitter$.subscribe((status) => service.nextRequestState(status));

        const completionEmitter$ = cold("- - a", { a: "1" });
        completionEmitter$.subscribe(() => service.completeEvents());

        expectObservable(service.getEvents$()).toBe("- a (b|)", {
          a: "1",
          b: "2",
        });

        expectObservable(service.getState$()).toBe("a b (c|)", {
          a: StateEnum.DORMANT,
          b: StateEnum.REQUESTING,
          c: StateEnum.READY,
        });
      });
    });
  });
});
