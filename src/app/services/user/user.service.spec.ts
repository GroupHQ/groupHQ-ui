import { TestBed } from "@angular/core/testing";
import { UserService } from "./user.service";
import { RsocketService } from "../network/rsocket/rsocket.service";
import { RsocketRequestsService } from "../network/rsocket/requests/rsocketRequests.service";
import { RsocketPrivateUpdateStreamService } from "../network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { ConfigService } from "../../config/config.service";
import { RETRY_FOREVER } from "../../app-tokens";
import { RetryForeverConstantService } from "../retry/retryForeverConstant.service";
import { cold, getTestScheduler } from "jasmine-marbles";

describe("UserService", () => {
  let service: UserService;
  let rsocketService: RsocketService;
  let rsocketRequestsService: RsocketRequestsService;
  let rsocketPrivateUpdateStreamService: RsocketPrivateUpdateStreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ConfigService, useValue: {} },
        { provide: RETRY_FOREVER, useValue: RetryForeverConstantService },
      ],
    });

    rsocketService = TestBed.inject(RsocketService);
    spyOn(rsocketService, "initializeRsocketConnection");

    rsocketPrivateUpdateStreamService = TestBed.inject(
      RsocketPrivateUpdateStreamService,
    );
    spyOn(rsocketPrivateUpdateStreamService, "initializePrivateUpdateStream");

    rsocketRequestsService = TestBed.inject(RsocketRequestsService);
    spyOnProperty(rsocketService, "isConnectionReady$").and.returnValue(
      cold("a", { a: true }),
    );
    spyOn(rsocketRequestsService, "currentMemberForUser");

    service = TestBed.inject(UserService);
  });

  it("should create the user service", () => {
    expect(service).toBeTruthy();
  });

  it("should return a uuid", () => {
    expect(service.uuid).toBeTruthy();
  });

  it("should return the same uuid", () => {
    expect(service.uuid).toEqual(service.uuid);
  });

  it("should return a different uuid when localStorage's uuid is cleared", () => {
    const uuid = service.uuid;
    localStorage.removeItem(service.MY_UUID_KEY);
    expect(service.uuid).not.toEqual(uuid);
    expect(service.uuid).toBeTruthy();
  });

  it("should return a different uuid when localStorage's uuid is tampered with", () => {
    const uuid = service.uuid;
    localStorage.setItem(service.MY_UUID_KEY, "test");

    expect(service.uuid).not.toEqual(uuid);
    expect(service.uuid).not.toEqual("test");
    expect(service.uuid).toBeTruthy();
  });

  it("should set the user's current member when connected to the server", () => {
    expect(rsocketService.initializeRsocketConnection).toHaveBeenCalled();

    getTestScheduler().flush();

    expect(rsocketRequestsService.currentMemberForUser).toHaveBeenCalledWith(
      jasmine.any(Function),
      service.uuid,
    );
  });
});
