import { TestBed } from "@angular/core/testing";
import { FlipService, ID_ATTRIBUTE_TOKEN } from "./flip.service";
import { AnimationBuilder } from "@angular/animations";
import { ChangeDetectorRef, QueryList } from "@angular/core";

describe("FlipService", () => {
  let service: FlipService;
  let queryList: QueryList<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlipService,
        { provide: ID_ATTRIBUTE_TOKEN, useValue: "test-id" },
        AnimationBuilder,
      ],
    });
    service = TestBed.inject(FlipService);
    queryList = new QueryList<any>();
  });

  describe("#animate", () => {
    it("should be created", () => {
      expect(service).toBeTruthy();
    });

    it("should throw error when components are not set", () => {
      expect(() => service.animate(() => {})).toThrowError(
        "Components not set",
      );
    });

    it("should not throw error when components are set", () => {
      service.setComponents(queryList);
      expect(() => service.animate(() => {})).not.toThrowError();
    });

    it("should animate without changeDetectorRef and removeId", () => {
      service.setComponents(queryList);
      expect(() => service.animate(() => {})).not.toThrowError();
    });

    it("should animate with changeDetectorRef and without removeId", () => {
      service.setComponents(queryList);
      const changeDetectorRef = {
        detectChanges: () => {},
      } as ChangeDetectorRef;
      expect(() =>
        service.animate(() => {}, changeDetectorRef),
      ).not.toThrowError();
    });

    it("should animate without changeDetectorRef and with removeId", () => {
      service.setComponents(queryList);
      expect(() =>
        service.animate(() => {}, undefined, "removeId"),
      ).not.toThrowError();
    });

    it("should animate with changeDetectorRef and removeId", () => {
      service.setComponents(queryList);
      const changeDetectorRef = {
        detectChanges: () => {},
      } as ChangeDetectorRef;
      expect(() =>
        service.animate(() => {}, changeDetectorRef, "removeId"),
      ).not.toThrowError();
    });
  });
});
