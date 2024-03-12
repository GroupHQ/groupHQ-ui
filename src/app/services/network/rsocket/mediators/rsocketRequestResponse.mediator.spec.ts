import { RsocketService } from "../rsocket.service";
import { TestBed } from "@angular/core/testing";
import { RsocketRequestFactory } from "./rsocketRequest.factory";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { BehaviorSubject } from "rxjs";
import { RSocketRequester } from "rsocket-messaging";
import { ConnectorStatesEnum } from "../ConnectorStatesEnum";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { RequestStateEnum } from "../../../state/RequestStateEnum";
import { ConfigService } from "../../../../config/config.service";
import { createMockRsocketRequester } from "../rsocket.service.spec";

describe("RsocketRequestResponseMediator", () => {
  let mediator: RequestServiceComponentInterface<any>;
  let connectionState$: BehaviorSubject<ConnectorStatesEnum>;
  let mockRSocketRequester: RSocketRequester;
  let rsocketService: RsocketService;
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
      RsocketRequestFactory,
    ).createRequestResponseMediator("route");

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("sends the request and emits the response when the #start method is called and the connection is ready", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      mockRSocketRequester = createMockRsocketRequester(
        cold("a|", { a: "response" }),
      );

      spyOnProperty(rsocketService, "rsocketRequester", "get").and.returnValue(
        mockRSocketRequester,
      );

      expectObservable(mediator.state$).toBe("(ab)", {
        a: RequestStateEnum.REQUESTING,
        b: RequestStateEnum.REQUEST_ACCEPTED,
      });

      expectObservable(mediator.events$).toBe("a", {
        a: "response",
      });

      mediator.start();
    });
  });

  it("does not send the request when the #start method is called and the connection is not ready", () => {
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.INITIALIZING);

      expectObservable(mediator.state$).toBe("a", {
        a: RequestStateEnum.INITIALIZING,
      });

      expectObservable(mediator.events$).toBe("-");

      mediator.start();
    });
  });

  it("emits an error when the request is sent", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      mockRSocketRequester = createMockRsocketRequester(
        cold("#", { error: "Simulated Error" }),
      );

      spyOnProperty(rsocketService, "rsocketRequester", "get").and.returnValue(
        mockRSocketRequester,
      );

      expectObservable(mediator.state$).toBe("(ab)", {
        a: RequestStateEnum.REQUESTING,
        b: RequestStateEnum.REQUEST_REJECTED,
      });

      expectObservable(mediator.events$).toBe("-");

      mediator.start();
    });
  });

  it("emits a TimeoutError if the request timeout is reached before a response is received", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      connectionState$.next(ConnectorStatesEnum.CONNECTED);

      mockRSocketRequester = createMockRsocketRequester(cold("-"));

      spyOnProperty(rsocketService, "rsocketRequester", "get").and.returnValue(
        mockRSocketRequester,
      );

      expectObservable(mediator.state$).toBe("a 4999ms b", {
        a: RequestStateEnum.REQUESTING,
        b: RequestStateEnum.REQUEST_TIMEOUT,
      });

      expectObservable(mediator.events$).toBe("-");

      mediator.start();
    });
  });
});
