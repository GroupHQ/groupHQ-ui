import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupBoardComponent } from "./groupBoard.component";
import { trigger } from "@angular/animations";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from "@angular/core";
import { FlipService } from "../../services/miscellaneous/flip.service";
import { StateTransitionService } from "../../services/miscellaneous/stateTransition.service";
import { cold, getTestScheduler } from "jasmine-marbles";
import { GroupManagerService } from "../services/groupManager.service";
import { HttpService } from "../../services/network/http.service";
import { IdentificationService } from "../../services/user/identification.service";
import { NEVER, of, Subject } from "rxjs";
import { AbstractRetryService } from "../../services/retry/abstractRetry.service";
import { ConfigService } from "../../config/config.service";
import { GroupCardComponent } from "../groupCard/groupCard.component";
import { GroupModel } from "../../model/group.model";
import { StatesEnum } from "../../model/enums/states.enum";
import { PublicEventModel } from "../../model/publicEvent.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { RsocketPublicUpdateStreamService } from "../../services/network/rsocket/rsocketPublicUpdateStream.service";

@Component({
  selector: "app-sync-banner",
  template: "",
})
class SyncBannerStubComponent {
  @Input()
  public isLoaded = false;

  @Input()
  public isSynced = false;

  @Input()
  public syncedTextState = false;
}

@Component({
  selector: "app-loading",
  template: "",
})
class LoadingStubComponent {
  @Input()
  itemName: string | null = null;

  @Input()
  nextRetry: number | null = null;

  @Input()
  minimumLoadingTimeSeconds = 1;

  @Input()
  retryFunction: (() => void) | null = null;

  @Input()
  loading = true;
}

@Component({
  selector: "app-group-cards",
  template: "",
})
class GroupCardsStubComponent {
  @Output()
  public groupCards = new EventEmitter<QueryList<GroupCardComponent>>();

  @Input()
  groups: GroupModel[] = [];

  @Input()
  isGroupsSynced = false;
}

const mockGroups: GroupModel[] = [
  {
    id: 1,
    title: "Group 1",
    description: "Group 1 description",
    status: "ACTIVE",
    currentGroupSize: 5,
    maxGroupSize: 10,
    lastActive: Date.now().toString(),
    lastModifiedDate: Date.now().toString(),
    lastModifiedBy: "Test User 1",
    createdDate: Date.now().toString(),
    createdBy: "Test User 1",
    version: 1,
  },
  {
    id: 2,
    title: "Group 2",
    description: "Group 2 description",
    status: "ACTIVE",
    currentGroupSize: 5,
    maxGroupSize: 10,
    lastActive: Date.now().toString(),
    lastModifiedDate: Date.now().toString(),
    lastModifiedBy: "Test User 2",
    createdDate: Date.now().toString(),
    createdBy: "Test User 2",
    version: 1,
  },
];

describe("GroupBoardComponent", () => {
  let fixture: ComponentFixture<GroupBoardComponent>;
  let component: GroupBoardComponent;
  let page: Page;
  let flipServiceStub: jasmine.SpyObj<FlipService>;
  let stateTransitionServiceStub: jasmine.SpyObj<StateTransitionService>;
  let groupManagerServiceStub: jasmine.SpyObj<GroupManagerService>;
  let httpServiceStub: jasmine.SpyObj<HttpService>;
  let rsocketPublicUpdateStreamService: any;
  let retryDefaultServiceStub: jasmine.SpyObj<AbstractRetryService>;

  beforeEach(async () => {
    flipServiceStub = jasmine.createSpyObj("FlipService", ["animate"]);
    flipServiceStub.animate.and.callFake(() => {});

    stateTransitionServiceStub = jasmine.createSpyObj(
      "StateTransitionService",
      ["transitionTo", "transitionWithQueuedDelayTo"],
    );
    stateTransitionServiceStub.transitionTo.and.callFake(() => {});
    stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
      () => {},
    );
    Object.defineProperty(stateTransitionServiceStub, "currentState$", {
      get: () => NEVER,
      configurable: true,
    });

    groupManagerServiceStub = jasmine.createSpyObj("GroupManagerService", [
      "handleUpdates",
      "triggerSort",
    ]);
    groupManagerServiceStub.handleUpdates.and.callFake(() => {});
    groupManagerServiceStub.triggerSort.and.callFake(() => {});
    Object.defineProperty(groupManagerServiceStub, "groupUpdateActions$", {
      get: () => NEVER,
      configurable: true,
    });

    httpServiceStub = jasmine.createSpyObj("HttpService", ["getGroups"]);
    httpServiceStub.getGroups.and.callFake(() => of([]));

    rsocketPublicUpdateStreamService = {
      get isPublicUpdatesStreamReady$(): any {
        return NEVER;
      },
      get publicUpdatesStream$(): any {
        return NEVER;
      },
    };

    retryDefaultServiceStub = jasmine.createSpyObj("RetryDefaultService", [
      "addRetryLogic",
    ]);
    retryDefaultServiceStub.addRetryLogic.and.callFake((arg: any) => arg);
    Object.defineProperty(retryDefaultServiceStub, "nextRetryInSeconds$", {
      get: () => NEVER,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [
        GroupBoardComponent,
        SyncBannerStubComponent,
        LoadingStubComponent,
        GroupCardsStubComponent,
      ],
      providers: [
        { provide: FlipService, useValue: flipServiceStub },
        {
          provide: StateTransitionService,
          useValue: stateTransitionServiceStub,
        },
        { provide: GroupManagerService, useValue: groupManagerServiceStub },
        { provide: HttpService, useValue: httpServiceStub },
        { provide: IdentificationService, useValue: {} },
        {
          provide: RsocketPublicUpdateStreamService,
          useValue: rsocketPublicUpdateStreamService,
        },
        { provide: AbstractRetryService, useValue: retryDefaultServiceStub },
        { provide: ConfigService, useValue: {} },
      ],
    })
      .overrideComponent(GroupBoardComponent, {
        set: {
          providers: [],
          animations: [trigger("groupChildAnimationEnabler", [])],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GroupBoardComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
  });

  it("creates the component", () => {
    expect(component).toBeTruthy();
  });

  function runNonReadyLoadGroups() {
    const subjectState = new Subject<StatesEnum>();
    Object.defineProperty(stateTransitionServiceStub, "currentState$", {
      get: () => subjectState.asObservable(),
    });
    stateTransitionServiceStub.transitionTo.and.callFake(
      (state: StatesEnum) => {
        subjectState.next(state);
      },
    );

    fixture.detectChanges();
    getTestScheduler().flush();
  }

  describe("initialization", () => {
    it("should load groups", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      fixture.detectChanges(); // first change detection triggers ngOnInit
      getTestScheduler().flush(); // flush observables

      expect(component.groups).toEqual(mockGroups);
    });

    it("should set the component state to loading by default", () => {
      expect(component.componentState).toBe(StatesEnum.LOADING);
    });

    it("should set the component state to loading when loading groups", () => {
      const groupsObservable = cold("-");
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      runNonReadyLoadGroups();

      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalled();
      expect(component.componentState).toBe(StatesEnum.LOADING);
    });

    it("should set the component state to error when loading groups fail", () => {
      const groupsObservable = cold("#");
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      runNonReadyLoadGroups();

      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalled();
      expect(component.componentState).toBe(
        StatesEnum.HTTP_INTERNAL_SERVER_ERROR,
      );
    });

    it("should set the component state to ready when loading groups succeed", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalled();
      expect(component.componentState).toBe(StatesEnum.READY);
    });

    it("should set the sync state to true if public update stream is connected", () => {
      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();

      subject.next(true);

      getTestScheduler().flush();

      expect(component.isGroupsSynced).toBeTrue();
      expect(component.syncedText).toBeTrue();
    });

    it("should set the sync state to false if public update stream is not connected", () => {
      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();

      subject.next(false);

      getTestScheduler().flush();

      expect(component.isGroupsSynced).toBeFalse();
      expect(component.syncedText).toBeFalse();
    });
  });

  describe("#loadGroups", () => {
    it("should load groups to the component", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      component.loadGroups();
      getTestScheduler().flush();

      expect(httpServiceStub.getGroups).toHaveBeenCalled();
      expect(component.groups).toEqual(mockGroups);
    });

    it("should load groups to the group manager service", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      component.loadGroups();
      getTestScheduler().flush();

      expect(httpServiceStub.getGroups).toHaveBeenCalled();
      expect(groupManagerServiceStub.groups).toEqual(mockGroups);
    });

    it("should set the component state to loading when loading groups", () => {
      const groupsObservable = cold("-");
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      component.loadGroups();
      getTestScheduler().flush();

      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalled();
      expect(component.componentState).toBe(StatesEnum.LOADING);
    });

    it("should set the component state to ready when loading groups succeed", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      component.loadGroups();
      getTestScheduler().flush();

      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).toHaveBeenCalledWith(StatesEnum.READY, jasmine.any(Number));
    });

    it("should set the component state to error when loading groups fail", () => {
      const groupsObservable = cold("#");
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      component.loadGroups();
      getTestScheduler().flush();

      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalledWith(
        StatesEnum.HTTP_INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe("#transitionState", () => {
    it(`transitions to the ${StatesEnum.HTTP_INTERNAL_SERVER_ERROR} state when the argument is ${StatesEnum.HTTP_INTERNAL_SERVER_ERROR}`, () => {
      component.transitionState(StatesEnum.HTTP_INTERNAL_SERVER_ERROR);
      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalledWith(
        StatesEnum.HTTP_INTERNAL_SERVER_ERROR,
      );
    });

    it(`transitions with a delay for each to the ${StatesEnum.NEUTRAL} followed by ${StatesEnum.READY} state when the argument is ${StatesEnum.READY}`, () => {
      component.transitionState(StatesEnum.READY);
      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).toHaveBeenCalledWith(StatesEnum.NEUTRAL, jasmine.any(Number));
      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).toHaveBeenCalledWith(StatesEnum.READY, jasmine.any(Number));
    });

    it(`transitions with a delay for each to the ${StatesEnum.NEUTRAL} followed by ${StatesEnum.LOADING} state when the argument is ${StatesEnum.LOADING} and groups have been loaded`, () => {
      component.isGroupsLoaded = true;
      component.transitionState(StatesEnum.LOADING);
      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).toHaveBeenCalledWith(StatesEnum.NEUTRAL, jasmine.any(Number));
      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).toHaveBeenCalledWith(StatesEnum.LOADING, jasmine.any(Number));
    });

    it(`transitions without delay to the ${StatesEnum.LOADING} state when the argument is ${StatesEnum.LOADING} and groups have not been loaded`, () => {
      component.isGroupsLoaded = false;
      component.transitionState(StatesEnum.LOADING);
      expect(stateTransitionServiceStub.transitionTo).toHaveBeenCalledWith(
        StatesEnum.LOADING,
      );
    });

    it(`sets the groups loaded flag to false when the argument is ${StatesEnum.LOADING}`, () => {
      component.isGroupsLoaded = true;
      component.transitionState(StatesEnum.LOADING);
      expect(component.isGroupsLoaded).toBeFalse();
    });

    it(`sets the groups loaded flag to false when the argument is ${StatesEnum.HTTP_INTERNAL_SERVER_ERROR}`, () => {
      component.isGroupsLoaded = true;
      component.transitionState(StatesEnum.HTTP_INTERNAL_SERVER_ERROR);
      expect(component.isGroupsLoaded).toBeFalse();
    });

    it(`sets the groups loaded flag to true when the argument is ${StatesEnum.READY}`, () => {
      component.isGroupsLoaded = false;
      component.transitionState(StatesEnum.READY);
      expect(component.isGroupsLoaded).toBeTrue();
    });

    it(`does not transition when the argument is ${StatesEnum.NEUTRAL}`, () => {
      component.transitionState(StatesEnum.NEUTRAL);
      expect(stateTransitionServiceStub.transitionTo).not.toHaveBeenCalled();
      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show the loading component when loading", () => {
      httpServiceStub.getGroups.and.callFake(() => NEVER);
      fixture.detectChanges();
      expect(page.isActiveLoadingComponentVisible).toBeTrue();
    });
  });

  describe("ready state", () => {
    it("render the group cards container", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();
      fixture.detectChanges();

      expect(
        stateTransitionServiceStub.transitionWithQueuedDelayTo,
      ).toHaveBeenCalled();
      expect(page.isCardsComponentVisible).toBeTrue();
    });
  });

  describe("failure states", () => {
    it("should show the loading failed state when loading fails", () => {
      const groupsObservable = cold("#");
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      runNonReadyLoadGroups();

      fixture.detectChanges();

      expect(page.isInactiveLoadingComponentVisible).toBeTrue();
    });

    it("should show the sync failed state when syncing fails and loading succeeds", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      subject.next(false);
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeTrue();
    });

    it("should not show the sync failed state when both loading and sync fails", () => {
      const groupsObservable = cold("#");
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      subject.next(false);
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeFalse();
    });

    it("should not show the loading failed state when loading succeeds", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      expect(component.componentState).toBe(StatesEnum.READY);
      expect(page.isInactiveLoadingComponentVisible).toBeFalse();
    });

    it("should not show the sync failed state when syncing succeeds", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      subject.next(true);
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeFalse();
    });

    it("should show the sync failed state if syncing fails after loading succeeds", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();

      subject.next(true);
      getTestScheduler().flush();
      fixture.detectChanges();

      subject.next(false);
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeTrue();
    });

    it("should trigger a new load when sync transitions from failed to success", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();
      fixture.detectChanges();

      subject.next(false);
      subject.next(true);

      expect(httpServiceStub.getGroups).toHaveBeenCalledTimes(2);
    });

    it("should not show the sync failed state if syncing transitions from failed to success after loading succeeds", () => {
      const groupsObservable = cold("a|", { a: mockGroups });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionWithQueuedDelayTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();

      subject.next(true);
      getTestScheduler().flush();
      fixture.detectChanges();

      subject.next(false);
      fixture.detectChanges();

      subject.next(true);
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeFalse();
    });

    it("should show the sync failed state when loading succeeds, syncing fails, and there are no groups", () => {
      const groupsObservable = cold("a|", { a: [] });
      httpServiceStub.getGroups.and.callFake(() => groupsObservable);

      const subjectState = new Subject<StatesEnum>();
      Object.defineProperty(stateTransitionServiceStub, "currentState$", {
        get: () => subjectState.asObservable(),
      });
      stateTransitionServiceStub.transitionTo.and.callFake(
        (state: StatesEnum) => {
          subjectState.next(state);
        },
      );

      const subject = new Subject<boolean>();
      Object.defineProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        {
          get: () => subject.asObservable(),
        },
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      subject.next(false);
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeTrue();
    });
  });

  describe("groups", () => {
    it("should pass an event handler to for the public updates stream", () => {
      const mockEvent = {} as PublicEventModel;
      const mockReadyObservable = cold("a", { a: true });

      spyOnProperty(
        rsocketPublicUpdateStreamService,
        "isPublicUpdatesStreamReady$",
        "get",
      ).and.returnValue(mockReadyObservable);
      spyOnProperty(
        rsocketPublicUpdateStreamService,
        "publicUpdatesStream$",
        "get",
      ).and.returnValue(cold("a", { a: mockEvent }));

      groupManagerServiceStub.handleUpdates.and.callFake(() => {});
      fixture.detectChanges();
      getTestScheduler().flush();
      expect(groupManagerServiceStub.handleUpdates).toHaveBeenCalledWith(
        mockEvent,
      );
    });

    it("should apply updates from the group manager service to the groups when component is ready", () => {
      component.componentState = StatesEnum.READY;

      const groupUpdateActions = [
        {
          eventType: EventTypeEnum.GROUP_CREATED,
          updateFunction: jasmine.createSpy("updateFunction1"),
          groupId: "1",
        },
        {
          eventType: EventTypeEnum.GROUP_DISBANDED,
          updateFunction: jasmine.createSpy("updateFunction2"),
          groupId: "2",
        },
        {
          eventType: EventTypeEnum.GROUP_STATUS_UPDATED,
          updateFunction: jasmine.createSpy("updateFunction3"),
          groupId: "3",
        },
      ];

      const groupUpdateActionsObservable = cold("-a-b-c-", {
        a: groupUpdateActions[0],
        b: groupUpdateActions[1],
        c: groupUpdateActions[2],
      });

      Object.defineProperty(groupManagerServiceStub, "groupUpdateActions$", {
        get: () => groupUpdateActionsObservable,
      });

      flipServiceStub.animate.and.callFake((updateFunction: () => any) =>
        updateFunction(),
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      expect(groupUpdateActions[0].updateFunction).toHaveBeenCalled();
      expect(groupUpdateActions[1].updateFunction).toHaveBeenCalled();
      expect(groupUpdateActions[2].updateFunction).toHaveBeenCalled();
    });

    it("should not apply updates from the group manager service to the groups when component is not ready", () => {
      component.componentState = StatesEnum.LOADING;

      const groupUpdateActions = [
        {
          eventType: EventTypeEnum.GROUP_CREATED,
          updateFunction: jasmine.createSpy("updateFunction1"),
          groupId: "1",
        },
      ];

      const groupUpdateActionsObservable = cold("-a-", {
        a: groupUpdateActions[0],
      });

      Object.defineProperty(groupManagerServiceStub, "groupUpdateActions$", {
        get: () => groupUpdateActionsObservable,
      });

      flipServiceStub.animate.and.callFake((updateFunction: () => any) =>
        updateFunction(),
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      expect(groupUpdateActions[0].updateFunction).not.toHaveBeenCalled();
    });

    it("should perform group disbanded updates by passing the groups id", () => {
      component.componentState = StatesEnum.READY;

      const groupUpdateActions = [
        {
          eventType: EventTypeEnum.GROUP_DISBANDED,
          updateFunction: jasmine.createSpy("updateFunction1"),
          groupId: "1",
        },
      ];

      const groupUpdateActionsObservable = cold("-a-", {
        a: groupUpdateActions[0],
      });

      Object.defineProperty(groupManagerServiceStub, "groupUpdateActions$", {
        get: () => groupUpdateActionsObservable,
      });

      flipServiceStub.animate.and.callFake((updateFunction: () => any) =>
        updateFunction(),
      );

      fixture.detectChanges();
      getTestScheduler().flush();

      expect(flipServiceStub.animate).toHaveBeenCalledOnceWith(
        groupUpdateActions[0].updateFunction,
        undefined,
        groupUpdateActions[0].groupId,
      );
      expect(groupUpdateActions[0].updateFunction).toHaveBeenCalled();
    });
  });
});

class Page {
  private _element: HTMLElement;

  constructor(fixture: ComponentFixture<GroupBoardComponent>) {
    this._element = fixture.nativeElement;
  }

  get isSyncBannerComponentVisible(): boolean {
    const element: HTMLElement | null = this._element.querySelector(
      "[data-test='sync-banner-component']",
    );
    return element !== null;
  }

  get isActiveLoadingComponentVisible(): boolean {
    const element = this._element.querySelector<HTMLElement>(
      "[data-test='loading-component__loading']",
    );
    return element !== null;
  }

  get isInactiveLoadingComponentVisible(): boolean {
    const element = this._element.querySelector<HTMLElement>(
      "[data-test='loading-component__http-internal-server-error']",
    );
    return element !== null;
  }

  get isCardsComponentVisible(): boolean {
    const element = this._element.querySelector<HTMLElement>(
      "[data-test='group-cards-component__ready']",
    );
    return element !== null;
  }
}
