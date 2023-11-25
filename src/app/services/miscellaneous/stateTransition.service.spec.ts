import { TestBed } from "@angular/core/testing";
import { StatesEnum } from "../../model/enums/states.enum";
import { StateTransitionService } from "./stateTransition.service";

describe("StateTransitionService", () => {
  let service: StateTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StateTransitionService],
    });
    service = TestBed.inject(StateTransitionService);
    jasmine.clock().install();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should transition to a new state", (done: DoneFn) => {
    const newState = StatesEnum.NEUTRAL;
    const subscription = service.currentState$.subscribe(
      (state: StatesEnum) => {
        expect(state).toBe(newState);
        subscription.unsubscribe();
        done();
      },
    );
    service.transitionTo(newState);
  });

  it("should handle delayed transition", (done: DoneFn) => {
    const newState = StatesEnum.NEUTRAL;
    const delay = 1000;

    const subscription = service.currentState$.subscribe(
      (state: StatesEnum) => {
        if (state === newState) {
          expect(state).toBe(newState);
          subscription.unsubscribe();
          done();
        }
      },
    );

    service.transitionWithQueuedDelayTo(newState, delay);

    jasmine.clock().tick(delay);
  });

  it("should handle multiple delayed transitions", (done: DoneFn) => {
    const expectedStates = [
      StatesEnum.LOADING,
      StatesEnum.NEUTRAL,
      StatesEnum.READY,
    ];
    const actualStates: StatesEnum[] = [];
    const delay = 1000;

    const subscription = service.currentState$.subscribe(
      (state: StatesEnum) => {
        actualStates.push(state);

        if (actualStates.length === expectedStates.length) {
          expect(actualStates).toEqual(expectedStates);
          subscription.unsubscribe();
          done();
        }
      },
    );

    service.transitionTo(StatesEnum.LOADING);
    service.transitionWithQueuedDelayTo(StatesEnum.NEUTRAL, delay);
    service.transitionWithQueuedDelayTo(StatesEnum.READY, delay);

    expect(actualStates.length).toBe(1);

    jasmine.clock().tick(delay / 2);
    expect(actualStates.length).toBe(1);

    jasmine.clock().tick(delay / 2);
    expect(actualStates.length).toBe(2);

    jasmine.clock().tick(delay);
    expect(actualStates.length).toBe(3);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });
});
