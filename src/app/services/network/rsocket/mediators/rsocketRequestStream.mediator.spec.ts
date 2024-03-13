import { RsocketService } from "../rsocket.service";
import { TestBed } from "@angular/core/testing";
import { RsocketRequestMediatorFactory } from "./rsocketRequestMediator.factory";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { BehaviorSubject } from "rxjs";
import { RSocketRequester } from "rsocket-messaging";
import { ConnectorStatesEnum } from "../ConnectorStatesEnum";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { RequestStateEnum } from "../../../state/RequestStateEnum";
import { ConfigService } from "../../../../config/config.service";
import { createMockRsocketRequester } from "../rsocket.service.spec";
import { RetryOptions } from "../../../retry/retry.options";

describe("RsocketRequestStreamMediator", () => {
  let mediator: RequestServiceComponentInterface<any>;
  let connectionState$: BehaviorSubject<ConnectorStatesEnum>;
  let mockRSocketRequester: RSocketRequester;
  let rsocketService: RsocketService;
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

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("sends the request and emits the response when the #start method is called and the connection is ready", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      mockRSocketRequester = createMockRsocketRequester(
        cold("a 10s b --- |", { a: "response1", b: "response2" }),
      );

      spyOnProperty(rsocketService, "rsocketRequester", "get").and.returnValue(
        mockRSocketRequester,
      );

      expectObservable(mediator.getState$()).toBe("(abc) 10s d", {
        a: RequestStateEnum.INITIALIZING,
        b: RequestStateEnum.REQUESTING,
        c: RequestStateEnum.READY,
        d: RequestStateEnum.REQUEST_COMPLETED,
      });

      expectObservable(mediator.getEvents$(true)).toBe("a 10s b", {
        a: "response1",
        b: "response2",
      });
    });
  });

  it("emits an error when the request is sent", () => {
    testScheduler.run((helpers) => {
      const { hot, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      mockRSocketRequester = createMockRsocketRequester(
        hot("a 5s #", { a: "response", error: "Simulated Error" }),
      );

      spyOnProperty(rsocketService, "rsocketRequester", "get").and.returnValue(
        mockRSocketRequester,
      );

      expectObservable(mediator.getState$()).toBe(
        "(abc) 4996ms d 4999ms (ef)",
        {
          a: RequestStateEnum.INITIALIZING,
          b: RequestStateEnum.REQUESTING,
          c: RequestStateEnum.READY,
          d: RequestStateEnum.RETRYING,
          e: RequestStateEnum.RETRYING,
          f: RequestStateEnum.REQUEST_REJECTED,
        },
      );

      expectObservable(mediator.getEvents$(true)).toBe("a", {
        a: "response",
      });
    });
  });
});
