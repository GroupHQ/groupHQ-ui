import { RsocketService } from "../rsocket.service";
import { TestBed } from "@angular/core/testing";
import { RsocketRequestMediatorFactory } from "./rsocketRequestMediator.factory";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { BehaviorSubject } from "rxjs";
import { ConnectorStatesEnum } from "../ConnectorStatesEnum";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { StateEnum } from "../../../state/StateEnum";
import { ConfigService } from "../../../../config/config.service";
import { RsocketRequestFactory } from "../rsocketRequest.factory";

describe("RsocketRequestResponseMediator", () => {
  let mediator: RequestServiceComponentInterface<any>;
  let connectionState$: BehaviorSubject<ConnectorStatesEnum>;
  let rsocketService: RsocketService;
  let rsocketRequestFactory: RsocketRequestFactory;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    connectionState$ = new BehaviorSubject<ConnectorStatesEnum>(
      ConnectorStatesEnum.INITIALIZING,
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    });

    rsocketService = TestBed.inject(RsocketService);
    spyOnProperty(rsocketService, "connectionState$", "get").and.returnValue(
      connectionState$.asObservable(),
    );

    mediator = TestBed.inject(
      RsocketRequestMediatorFactory,
    ).createRequestResponseMediator("route");

    rsocketRequestFactory = TestBed.inject(RsocketRequestFactory);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("sends the request and emits the response when the #start method is called and the connection is ready", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      const response = cold("a 5ms |", { a: "response" });
      spyOn(rsocketRequestFactory, "createRequestResponse").and.returnValue(
        response,
      );

      expectObservable(mediator.getState$()).toBe("(a b c d) (e |)", {
        a: StateEnum.DORMANT,
        b: StateEnum.INITIALIZING,
        c: StateEnum.REQUESTING,
        d: StateEnum.REQUEST_ACCEPTED,
        e: StateEnum.REQUEST_COMPLETED,
      });

      expectObservable(mediator.getEvents$(true)).toBe("a 5ms |", {
        a: "response",
      });
    });
  });

  it("does not send the request when the #start method is called and the connection is not ready", () => {
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.INITIALIZING);

      expectObservable(mediator.getState$()).toBe("(a b)", {
        a: StateEnum.DORMANT,
        b: StateEnum.INITIALIZING,
      });

      expectObservable(mediator.getEvents$(true)).toBe("-");
    });
  });

  it("emits an error when the request is sent", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      const response = cold("#", { error: "Simulated Error" });
      spyOn(rsocketRequestFactory, "createRequestResponse").and.returnValue(
        response,
      );

      expectObservable(mediator.getState$()).toBe("(a b c d)", {
        a: StateEnum.DORMANT,
        b: StateEnum.INITIALIZING,
        c: StateEnum.REQUESTING,
        d: StateEnum.REQUEST_REJECTED,
      });

      expectObservable(mediator.getEvents$(true)).toBe("-");
    });
  });

  it("emits a TimeoutError if the request timeout is reached before a response is received", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      const response = cold("-");
      spyOn(rsocketRequestFactory, "createRequestResponse").and.returnValue(
        response,
      );

      expectObservable(mediator.getState$()).toBe("(a b c) 4995ms d", {
        a: StateEnum.DORMANT,
        b: StateEnum.INITIALIZING,
        c: StateEnum.REQUESTING,
        d: StateEnum.REQUEST_TIMEOUT,
      });

      expectObservable(mediator.getEvents$(true)).toBe("-");
    });
  });
});
