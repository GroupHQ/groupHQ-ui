import { RsocketService } from "./rsocket.service";
import { RsocketConnectorService } from "./rsocketConnector.service";
import { TestBed } from "@angular/core/testing";
import { ConfigService } from "../../../config/config.service";
import { RSocket } from "rsocket-core";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { take } from "rxjs";
import { ConnectorStatesEnum } from "./ConnectorStatesEnum";
import { RetryOptions } from "../../retry/retry.options";
import { RsocketRequestFactory } from "./rsocketRequest.factory";

describe("RsocketService", () => {
  let service: RsocketService;

  let rsocketConnectorService: jasmine.SpyObj<RsocketConnectorService>;
  let rsocketRequestFactory: RsocketRequestFactory;
  let mockRSocket: jasmine.SpyObj<RSocket>;

  let testScheduler: TestScheduler;

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
    rsocketRequestFactory = TestBed.inject(RsocketRequestFactory);
  });

  it("should automatically set up the RSocket connection when the service is loaded in", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const mockPingResponse = cold("--b|", { b: true });

      rsocketConnectorService.connect.and.returnValue(
        cold("a|", { a: mockRSocket }),
      );
      spyOn(rsocketRequestFactory, "createRequestResponse").and.returnValue(
        mockPingResponse,
      );

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a--b", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.CONNECTED,
      });
    });
  });

  it("should transition to the RETRYING state when connecting to the server fails", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable, flush } = helpers;
      rsocketConnectorService.connect.and.returnValue(cold("---#"));

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a--b-- 5s (cd)", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.RETRYING,
        c: ConnectorStatesEnum.RETRYING,
        d: ConnectorStatesEnum.RETRIES_EXHAUSTED,
      });

      flush();

      expect(mockRSocket.onClose).not.toHaveBeenCalled();
    });
  });

  it("should transition to the RETRYING state when pinging fails after connecting to the server", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable, flush } = helpers;
      const mockPingResponse = cold("---#");

      rsocketConnectorService.connect.and.returnValue(
        cold("a|", { a: mockRSocket }),
      );
      spyOn(rsocketRequestFactory, "createRequestResponse").and.returnValue(
        mockPingResponse,
      );

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a---b--- 5s (cd)", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.RETRYING,
        c: ConnectorStatesEnum.RETRYING,
        d: ConnectorStatesEnum.RETRIES_EXHAUSTED,
      });

      flush();

      expect(mockRSocket.onClose).not.toHaveBeenCalled();
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

      rsocketConnectorService.connect.and.returnValue(
        cold("a|", { a: mockRSocket }),
      );
      spyOn(rsocketRequestFactory, "createRequestResponse").and.returnValue(
        mockPingResponse,
      );

      service.initializeRsocketConnection();

      expectObservable(service.connectionState$).toBe("a--b", {
        a: ConnectorStatesEnum.INITIALIZING,
        b: ConnectorStatesEnum.CONNECTED,
      });

      flush();

      expect(mockRSocket.onClose).toHaveBeenCalled();

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
