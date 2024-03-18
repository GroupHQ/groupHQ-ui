import { RsocketService } from "../rsocket.service";
import { TestBed } from "@angular/core/testing";
import { RsocketRequestMediatorFactory } from "./rsocketRequestMediator.factory";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { BehaviorSubject } from "rxjs";
import { ConnectorStatesEnum } from "../ConnectorStatesEnum";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { StateEnum } from "../../../state/StateEnum";
import { ConfigService } from "../../../../config/config.service";
import { RetryOptions } from "../../../retry/retry.options";
import { RsocketRequestFactory } from "../rsocketRequest.factory";

describe("RsocketRequestStreamMediator", () => {
  let mediator: RequestServiceComponentInterface<any>;
  let connectionState$: BehaviorSubject<ConnectorStatesEnum>;
  let rsocketService: RsocketService;
  let rsocketRequestFactory: RsocketRequestFactory;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    connectionState$ = new BehaviorSubject<ConnectorStatesEnum>(
      ConnectorStatesEnum.INITIALIZING,
    );

    const retryOptions: RetryOptions = {
      MAX_ATTEMPTS: 2,
      MIN_RETRY_INTERVAL: 5,
      MAX_RETRY_INTERVAL: 5,
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get retryDefaultStrategy(): RetryOptions {
              return retryOptions;
            },
          },
        },
      ],
    });

    rsocketService = TestBed.inject(RsocketService);
    spyOnProperty(rsocketService, "connectionState$", "get").and.returnValue(
      connectionState$.asObservable(),
    );

    mediator = TestBed.inject(
      RsocketRequestMediatorFactory,
    ).createStreamMediator("route");

    rsocketRequestFactory = TestBed.inject(RsocketRequestFactory);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("sends the request and emits the response when the #start method is called and the connection is ready", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      const streamResponse = cold("a 10s - b --- |", {
        a: "response1",
        b: "response2",
      });
      spyOn(rsocketRequestFactory, "createRequestStream").and.returnValue(
        streamResponse,
      );

      expectObservable(mediator.getState$()).toBe("(a b c d) 10s (e|)", {
        a: StateEnum.DORMANT,
        b: StateEnum.INITIALIZING,
        c: StateEnum.REQUESTING,
        d: StateEnum.READY,
        e: StateEnum.REQUEST_COMPLETED,
      });

      expectObservable(mediator.getEvents$(true)).toBe("a 10s - b --- |", {
        a: "response1",
        b: "response2",
      });
    });
  });

  it("emits an error when the request is sent", () => {
    testScheduler.run((helpers) => {
      const { hot, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      const streamResponse = hot("a 5s #", {
        a: "response",
        error: "Simulated Error",
      });
      spyOn(rsocketRequestFactory, "createRequestStream").and.returnValue(
        streamResponse,
      );

      expectObservable(mediator.getState$()).toBe(
        "(a b c d) 4995ms e 4999ms (fg)",
        {
          a: StateEnum.DORMANT,
          b: StateEnum.INITIALIZING,
          c: StateEnum.REQUESTING,
          d: StateEnum.READY,
          e: StateEnum.RETRYING,
          f: StateEnum.RETRYING,
          g: StateEnum.REQUEST_REJECTED,
        },
      );

      expectObservable(mediator.getEvents$(true)).toBe("a", {
        a: "response",
      });
    });
  });
});
