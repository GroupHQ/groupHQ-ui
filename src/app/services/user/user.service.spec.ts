import { TestBed } from "@angular/core/testing";
import { UserService } from "./user.service";
import { ConfigService } from "../../config/config.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, { provide: ConfigService, useValue: {} }],
    });

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
});
