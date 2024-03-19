import { TestBed } from "@angular/core/testing";
import { FlipService } from "./flip.service";
import { AnimationBuilder } from "@angular/animations";
import { QueryList } from "@angular/core";

describe("FlipService", () => {
  let service: FlipService;
  let queryList: QueryList<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlipService, AnimationBuilder],
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
  });
});
