import { TestBed } from "@angular/core/testing";
import { IdentificationService } from "./identification.service";

describe("IdentificationService", () => {
  let service: IdentificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdentificationService],
    });

    service = TestBed.inject(IdentificationService);
  });

  it("should create the identification service", () => {
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
