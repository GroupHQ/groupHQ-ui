import { RsocketService } from "./rsocket.service";
import { RsocketConnectorService } from "./rsocketConnector.service";
import { TestBed } from "@angular/core/testing";
import { ConfigService } from "../../../config/config.service";
import { RSocket } from "rsocket-core";
import { RequestSpec, RSocketRequester } from "rsocket-messaging";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { WellKnownMimeType } from "rsocket-composite-metadata";
import { Observable, take } from "rxjs";
import { ConnectorStatesEnum } from "./ConnectorStatesEnum";
import { RetryOptions } from "../../retry/retry.options";
import { Buffer } from "buffer";
import { ColdObservable } from "rxjs/internal/testing/ColdObservable";

export function createMockRsocketRequester(
  responseObservable: Observable<any>,
) {
  const mockRequestSpec: RequestSpec = {
    metadata: function (
      key: string | WellKnownMimeType | number,
      content: Buffer,
    ): RequestSpec {
      return this;
    },
    request: function <TResponseType>(): TResponseType {
      return responseObservable as unknown as TResponseType;
    },
  };

  const mockRSocketRequester: RSocketRequester = {
    route: function (route: string): RequestSpec {
      return mockRequestSpec;
    },
  };

  return mockRSocketRequester;
}

describe("RsocketService", () => {
  let service: RsocketService;

  let rsocketConnectorService: jasmine.SpyObj<RsocketConnectorService>;
  let mockRSocket: jasmine.SpyObj<RSocket>;

  let testScheduler: TestScheduler;

  function mockRsocketConnector(
    mockRsocketResponse: ColdObservable<RSocket>,
    mockPingResponse: ColdObservable<boolean>,
  ) {
    rsocketConnectorService.connect.and.returnValue(mockRsocketResponse);

    const mockRSocketRequester = createMockRsocketRequester(mockPingResponse);
    spyOn(RSocketRequester, "wrap").and.returnValue(mockRSocketRequester);
  }

  beforeEach(() => {
    rsocketConnectorService = jasmine.createSpyObj<RsocketConnectorService>(
      "RsocketConnectorService",
      ["connect"],
    );
    mockRSocket = jasmine.createSpyObj<RSocket>("RSocket", [
      "requestResponse",
      "close",
      "onClose",
    ]);

    const retryOptions: RetryOptions = {
      MAX_ATTEMPTS: 2,
      MIN_RETRY_INTERVAL: 5,
      MAX_RETRY_INTERVAL: 5,
    };

    TestBed.configureTestingModule({
      providers: [
        RsocketService,
        { provide: RsocketConnectorService, useValue: rsocketConnectorService },
        {
          provide: ConfigService,
          useValue: {
            get retryForeverStrategy(): RetryOptions {
              return retryOptions;
            },
          },
        },
      ],
    });

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    service = TestBed.inject(RsocketService);
  });

  it("should automatically set up the RSocket connection when the service is loaded in", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const mockPingResponse = cold("--b|", { b: true });

      mockRsocketConnector(cold("a|", { a: mockRSocket }), mockPingResponse);

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a--b", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.CONNECTED,
      });
    });
  });

  it("should transition to the RETRYING state when connecting to the server fails", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      rsocketConnectorService.connect.and.returnValue(cold("---#"));

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a--b-- 5s (cd)", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.RETRYING,
        c: ConnectorStatesEnum.RETRYING,
        d: ConnectorStatesEnum.RETRIES_EXHAUSTED,
      });
    });
  });

  it("should transition to the RETRYING state when pinging fails after connecting to the server", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const mockPingResponse = cold("---#");
      rsocketConnectorService.connect.and.returnValue(
        cold("a|", { a: mockRSocket }),
      );

      const mockRSocketRequester = createMockRsocketRequester(mockPingResponse);
      spyOn(RSocketRequester, "wrap").and.returnValue(mockRSocketRequester);

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a---b--- 5s (cd)", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.RETRYING,
        c: ConnectorStatesEnum.RETRYING,
        d: ConnectorStatesEnum.RETRIES_EXHAUSTED,
      });
    });
  });

  it("should automatically retry connection setup after the connection has been closed", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable, flush } = helpers;
      const mockPingResponse = cold("--b|", { b: true });

      let onCloseCallBack: any;
      mockRSocket.onClose.and.callFake((callback) => {
        onCloseCallBack = callback;
      });

      mockRsocketConnector(cold("a|", { a: mockRSocket }), mockPingResponse);

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a--b", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.CONNECTED,
      });

      flush();

      service.connectionState$.pipe(take(1)).subscribe((state) => {
        if (state === ConnectorStatesEnum.CONNECTED) {
          onCloseCallBack();
        }
      });

      expectObservable(service.connectionState$).toBe("----a--b", {
        a: ConnectorStatesEnum.RETRYING,
        b: ConnectorStatesEnum.CONNECTED,
      });
    });
  });
});
