import { TestBed } from "@angular/core/testing";
import { RsocketService } from "./rsocket.service";
import { RsocketConnectorService } from "./rsocketConnector.service";
import { AbstractRetryService } from "../../retry/abstractRetry.service";
import { cold, getTestScheduler } from "jasmine-marbles";
import { ConfigService } from "../../../config/config.service";
import { RETRY_FOREVER } from "../../../app-tokens";
import { RsocketPublicUpdateStreamService } from "./rsocketPublicUpdateStream.service";

describe("RsocketService", () => {
  let service: RsocketService;

  let retryServiceStub: jasmine.SpyObj<AbstractRetryService>;
  let rsocketConnectorStub: jasmine.SpyObj<RsocketConnectorService>;
  let testModuleConfiguration: any;

  beforeEach(() => {
    retryServiceStub = jasmine.createSpyObj<AbstractRetryService>(
      "AbstractRetryService",
      ["addRetryLogic"],
    );
    retryServiceStub.addRetryLogic.and.callFake((observable) => observable);

    rsocketConnectorStub = jasmine.createSpyObj<RsocketConnectorService>(
      "RsocketConnectorService",
      ["connectToServer"],
    );
    rsocketConnectorStub.connectToServer.and.returnValue(cold("-"));

    testModuleConfiguration = {
      providers: [
        RsocketService,
        { provide: RsocketConnectorService, useValue: rsocketConnectorStub },
        {
          provide: ConfigService,
          useValue: {
            rsocketMinimumDisconnectRetryTime: 5,
            rsocketMaximumDisconnectRetryTime: 5,
          },
        },
        {
          provide: RETRY_FOREVER,
          useValue: retryServiceStub,
        },
        {
          provide: RsocketPublicUpdateStreamService,
          useValue: {},
        },
      ],
    };
  });

  it("should create", () => {
    TestBed.configureTestingModule(testModuleConfiguration);
    service = TestBed.inject(RsocketService);
    expect(service).toBeTruthy();
  });

  it("should have attempted to connect to the server once", () => {
    TestBed.configureTestingModule(testModuleConfiguration);
    service = TestBed.inject(RsocketService);
    getTestScheduler().flush();
    expect(rsocketConnectorStub.connectToServer).toHaveBeenCalledTimes(1);
  });

  it("should attempt to reconnect to the server after connection is closed based on the configured delay", () => {
    jasmine.clock().install();

    const rsocketMock = jasmine.createSpyObj("RSocket", ["onClose"]);
    let onCloseCallback: any;
    rsocketMock.onClose.and.callFake((callback: any) => {
      onCloseCallback = callback;
    });

    rsocketConnectorStub.connectToServer.and.returnValue(
      cold("a|", { a: rsocketMock }),
    );
    TestBed.configureTestingModule(testModuleConfiguration);
    service = TestBed.inject(RsocketService);

    getTestScheduler().flush();

    expect(rsocketMock.onClose).toHaveBeenCalledTimes(1);
    onCloseCallback();
    jasmine.clock().tick(5000);
    expect(rsocketConnectorStub.connectToServer).toHaveBeenCalledTimes(2);

    jasmine.clock().uninstall();
  });
});
