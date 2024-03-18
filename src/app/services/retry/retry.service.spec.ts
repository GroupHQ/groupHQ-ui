import { RetryService } from "./retry.service";
import { TestBed } from "@angular/core/testing";
import { RetryStrategy } from "./strategies/retry.strategy";
import { defer, Observable, of, throwError } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";

function createRetryStrategy(
  maxAttempts: number,
  minInterval: number,
  maxInterval: number,
): RetryStrategy {
  return {
    retryServiceOptions: {
      MAX_ATTEMPTS: maxAttempts,
      MIN_RETRY_INTERVAL: minInterval,
      MAX_RETRY_INTERVAL: maxInterval,
    },
  };
}

function generateRetryMarbles(
  retryStrategy: RetryStrategy,
  success = false,
): string {
  const retryOptions = retryStrategy.retryServiceOptions;

  const attempts = Array.from(
    { length: retryOptions.MAX_ATTEMPTS - 1 },
    () => `${retryOptions.MIN_RETRY_INTERVAL}s `,
  ).join("");

  return success ? attempts + "(a|)" : attempts + "#";
}

function createFailingObservable(
  retryStrategy: RetryStrategy,
): Observable<any> {
  const attemptsBeforeSuccess =
    retryStrategy.retryServiceOptions.MAX_ATTEMPTS - 1;

  if (attemptsBeforeSuccess < 1) {
    throw new Error(`Max retry options too low: ${retryStrategy.retryServiceOptions.MAX_ATTEMPTS}. 
    Must be at least 2 in order to fail then succeed`);
  }

  let attempts = 0;

  return defer(() => {
    if (attempts++ < attemptsBeforeSuccess) {
      return throwError(() => new Error("Simulated error"));
    } else {
      return of("success");
    }
  });
}

describe("RetryService", () => {
  let service: RetryService;

  let retryStrategyA: RetryStrategy;
  let observableKeyA: string;

  let retryStrategyB: RetryStrategy;
  let observableKeyB: string;

  let testScheduler: TestScheduler;

  beforeEach(() => {
    retryStrategyA = createRetryStrategy(5, 5, 5);
    observableKeyA = uuidv4();

    retryStrategyB = createRetryStrategy(7, 10, 10);
    observableKeyB = uuidv4();

    observableKeyB = uuidv4();

    TestBed.configureTestingModule({
      providers: [RetryService],
    });

    service = TestBed.inject(RetryService);
    expect(service).toBeTruthy();

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("retry strategy behavior", () => {
    it("should retry an observable up to the maximum number of attempts", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const MAX_RETRIES = retryStrategyA.retryServiceOptions.MAX_ATTEMPTS;
        expect(MAX_RETRIES).toBeGreaterThanOrEqual(2);

        const retryMarbles = generateRetryMarbles(retryStrategyA);

        const errorObservableWithRetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategyA,
        );

        expectObservable(errorObservableWithRetry).toBe(retryMarbles);
      });
    });

    it("should stop retrying once successful", () => {
      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;

        const observableWithRetry = service.addRetryLogic(
          createFailingObservable(retryStrategyA),
          observableKeyA,
          retryStrategyA,
        );

        const expectedMarbles = generateRetryMarbles(retryStrategyA, true);
        expectObservable(observableWithRetry).toBe(expectedMarbles, {
          a: "success",
        });
      });
    });

    it("should not allow subscriptions to an outdated observable", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const errorObservableWithRetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategyA,
        );

        const newErrorObservableWithRetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategyA,
        );

        expectObservable(errorObservableWithRetry).toBe(
          "#",
          undefined,
          new Error("Observable version mismatch"),
        );
        expectObservable(newErrorObservableWithRetry).toBe(
          generateRetryMarbles(retryStrategyA),
        );
      });
    });

    it("should complete an existing observable when a new one is created with the same key", () => {
      testScheduler.run((helpers) => {
        const { cold, hot, expectObservable } = helpers;

        const firstObservableWithRetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategyA,
        );

        const completionSignal = hot(" -----x");
        completionSignal.subscribe(() => {
          service.addRetryLogic(cold("-"), observableKeyA, retryStrategyA);
        });

        expectObservable(firstObservableWithRetry).toBe("-----|");
      });
    });

    it("should not complete an existing observable when a new one is created with a different key", () => {
      testScheduler.run((helpers) => {
        const { cold, hot, expectObservable } = helpers;

        const firstObservableWithRetry = service.addRetryLogic(
          cold("-"),
          observableKeyA,
          retryStrategyA,
        );

        const completionSignal = hot(" -----x");
        completionSignal.subscribe(() => {
          service.addRetryLogic(cold("-"), observableKeyB, retryStrategyA);
        });

        expectObservable(firstObservableWithRetry).toBe("-");
      });
    });

    it("should complete an existing observable's retry time when a new one is created with the same key", () => {
      testScheduler.run((helpers) => {
        const { cold, hot, expectObservable } = helpers;

        const firstObservableWithRetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategyA,
        );

        const nextRetryTimeObservable =
          service.getNextRetryTime$(observableKeyA);
        expect(nextRetryTimeObservable).toBeTruthy();

        const completionSignal = hot("-----x");
        completionSignal.subscribe(() => {
          service.addRetryLogic(cold("-"), observableKeyA, retryStrategyA);
        });

        expectObservable(firstObservableWithRetry).toBe("-----|");
        expectObservable(nextRetryTimeObservable!).toBe("(ab)-|", {
          a: 0,
          b: 5,
        });
      });
    });

    it("should not complete an existing observable's retry time when a new one is created with a different key", () => {
      testScheduler.run((helpers) => {
        const { cold, hot, expectObservable } = helpers;

        const firstObservableWithRetry = service.addRetryLogic(
          cold("-"),
          observableKeyA,
          retryStrategyA,
        );

        const nextRetryTimeObservable =
          service.getNextRetryTime$(observableKeyA);
        expect(nextRetryTimeObservable).toBeTruthy();

        const completionSignal = hot("-----x");
        completionSignal.subscribe(() => {
          service.addRetryLogic(cold("-"), observableKeyB, retryStrategyA);
        });

        expectObservable(firstObservableWithRetry).toBe("-");
        expectObservable(nextRetryTimeObservable!).toBe("a", { a: 0 });
      });
    });

    describe("retry interval", () => {
      it("should save the next retry time after each attempt", () => {
        testScheduler.run((helpers) => {
          service.currentTime = () => testScheduler.now();
          const { cold, expectObservable } = helpers;

          const retryStrategy = createRetryStrategy(2, 5, 5);

          const errorObservableWithRetry = service.addRetryLogic(
            cold("#"),
            observableKeyA,
            retryStrategy,
          );

          const nextRetryTimeObservable =
            service.getNextRetryTime$(observableKeyA);
          expect(nextRetryTimeObservable).toBeTruthy();

          expectObservable(errorObservableWithRetry).toBe(
            generateRetryMarbles(retryStrategy),
          );
          expectObservable(nextRetryTimeObservable!).toBe(
            "(ab) 996ms c 999ms d 999ms e 999ms f 999ms (g|)",
            {
              a: 0,
              b: 5,
              c: 4,
              d: 3,
              e: 2,
              f: 1,
              g: 0,
            },
          );
        });
      });

      it("should not exceed the maximum retry interval", () => {
        testScheduler.run((helpers) => {
          service.currentTime = () => testScheduler.now();
          const { cold, expectObservable } = helpers;

          const retryStrategy = createRetryStrategy(2, 1, 1);

          const errorObservableWithRetry = service.addRetryLogic(
            cold("#"),
            observableKeyA,
            retryStrategy,
          );

          const nextRetryTimeObservable =
            service.getNextRetryTime$(observableKeyA);
          expect(nextRetryTimeObservable).toBeTruthy();

          expectObservable(errorObservableWithRetry).toBe(
            generateRetryMarbles(retryStrategy),
          );
          expectObservable(nextRetryTimeObservable!).toBe("(ab) 996ms (c|)", {
            a: 0,
            b: 1,
            c: 0,
          });
        });
      });
    });
  });

  describe("multiple concurrent retry strategies", () => {
    it("should use the correct retry strategy for each observable", () => {
      testScheduler.run((helpers) => {
        const { cold, expectObservable } = helpers;

        const errorObservableWithStrategyARetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategyA,
        );

        const errorObservableWithStrategyBRetry = service.addRetryLogic(
          cold("#"),
          observableKeyB,
          retryStrategyB,
        );

        expectObservable(errorObservableWithStrategyARetry).toBe(
          generateRetryMarbles(retryStrategyA),
        );
        expectObservable(errorObservableWithStrategyBRetry).toBe(
          generateRetryMarbles(retryStrategyB),
        );
      });
    });
  });

  describe("backoff time calculation", () => {
    it("should increase the retry time for every retry", () => {
      testScheduler.run((helpers) => {
        service.currentTime = () => testScheduler.now();
        const { cold, expectObservable } = helpers;

        const retryStrategy = createRetryStrategy(5, 1, 60);

        const errorObservableWithRetry = service.addRetryLogic(
          cold("#"),
          observableKeyA,
          retryStrategy,
        );

        const nextRetryTimeObservable =
          service.getNextRetryTime$(observableKeyA);
        expect(nextRetryTimeObservable).toBeTruthy();

        expectObservable(errorObservableWithRetry);

        let retryFinished = false;
        let maxRetryTime: number | null = null;

        nextRetryTimeObservable!.subscribe((retryTime) => {
          if (maxRetryTime === null) {
            maxRetryTime = retryTime;
            return;
          }

          if (retryTime == 0) {
            retryFinished = true;
            return;
          }

          if (retryFinished) {
            expect(retryTime).toBeGreaterThan(maxRetryTime);
            maxRetryTime = retryTime;
            retryFinished = false;
          }
        });
      });
    });
  });
});
