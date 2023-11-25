import { of, throwError } from "rxjs";
import { TestBed } from "@angular/core/testing";
import { ConfigService } from "../../config/config.service";
import { RetryForeverConstantService } from "./retryForeverConstant.service";

describe("RetryForeverConstantService", () => {
  let service: RetryForeverConstantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RetryForeverConstantService,
        { provide: ConfigService, useValue: null },
      ],
    });
    service = TestBed.inject(RetryForeverConstantService);
    jasmine.clock().install();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should return a retry logic", () => {
    const observable = of("test");
    const retryLogic = service.addRetryLogic(observable);
    expect(retryLogic).toBeTruthy();
  });

  it("should retry an observable emitting an error", (done) => {
    const observable = throwError(() => new Error("test"));
    const retryLogic = service.addRetryLogic(observable);
    const subscription = retryLogic.subscribe({
      error: (err) => {
        fail(`Should not have errored: ${err}`);
        subscription.unsubscribe();
      },
    });

    // ticks forward 1 day. Caution: longer times will take longer to tick through
    jasmine.clock().tick(1000 * 60 * 60 * 24);
    expect(subscription.closed).toBe(false);
    done();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });
});
