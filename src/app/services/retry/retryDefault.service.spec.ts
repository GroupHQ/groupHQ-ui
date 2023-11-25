import { of, throwError } from "rxjs";
import { RetryDefaultService } from "./retryDefault.service";
import { TestBed } from "@angular/core/testing";
import { ConfigService } from "../../config/config.service";

describe("RetryDefaultService", () => {
  let service: RetryDefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RetryDefaultService,
        { provide: ConfigService, useValue: null },
      ],
    });
    service = TestBed.inject(RetryDefaultService);
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
        expect(err).toBeTruthy();
        subscription.unsubscribe();
        done();
      },
    });

    for (let i = 0; i < service.MAX_RETRY_ATTEMPTS; i++) {
      jasmine.clock().tick(service.MIN_RETRY_INTERVAL * 1000);
      expect(subscription.closed).toBe(false);
    }

    for (let i = 0; i < service.MAX_RETRY_ATTEMPTS; i++) {
      jasmine.clock().tick(service.MAX_RETRY_INTERVAL * 1000);
    }

    expect(subscription.closed).toBe(true);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });
});
