import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from "@angular/core";
import { GroupCardComponent } from "../groupCard/groupCard.component";
import { GroupModel } from "../../model/group.model";
import { GroupBoardComponent } from "./groupBoard.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupManagerService } from "../services/groupManager.service";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ConfigService } from "../../config/config.service";
import { trigger } from "@angular/animations";
import { StateEnum } from "src/app/services/state/StateEnum";
import { of } from "rxjs";

@Component({
  selector: "app-sync-banner",
  template: "",
  standalone: true,
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
  standalone: true,
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
  standalone: true,
})
class GroupCardsStubComponent {
  @Output()
  public groupCards = new EventEmitter<QueryList<GroupCardComponent>>();

  @Input()
  groups: GroupModel[] = [];

  @Input()
  isGroupsSynced = false;
}

describe("GroupBoardComponent", () => {
  let fixture: ComponentFixture<GroupBoardComponent>;
  let component: GroupBoardComponent;
  let page: Page;
  let groupManagerService: GroupManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    })
      .overrideComponent(GroupBoardComponent, {
        set: {
          imports: [
            SyncBannerStubComponent,
            LoadingStubComponent,
            GroupCardsStubComponent,
          ],
          providers: [],
          animations: [trigger("groupChildAnimationEnabler", [])],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GroupBoardComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    groupManagerService = TestBed.inject(GroupManagerService);
  });

  describe("initial state", () => {
    it("should create the component in the INITIALIZING state", () => {
      expect(component.componentState).toBe(StateEnum.INITIALIZING);
    });

    it("should set the the groups loaded flag to true if the component state from Group Manager Service is ready", () => {
      spyOnProperty(
        groupManagerService,
        "componentState",
        "get",
      ).and.returnValue(StateEnum.READY);

      component =
        TestBed.createComponent(GroupBoardComponent).componentInstance;

      expect(component.isGroupsLoaded).toBeTrue();
    });

    it("should set the synced text and groups synced flags to true if the group state from Group Manager Service is ready", () => {
      spyOnProperty(groupManagerService, "groupState").and.returnValue(
        StateEnum.READY,
      );

      component =
        TestBed.createComponent(GroupBoardComponent).componentInstance;

      expect(component.syncedText).toBeTrue();
      expect(component.isGroupsSynced).toBeTrue();
    });
  });

  describe("ngOnInit", () => {
    describe("initializing timeout", () => {
      beforeEach(() => {
        spyOn(groupManagerService, "subscribeToGroupsStream");
      });

      afterEach(() => {
        jasmine.clock().uninstall();
      });

      it("should set the component state to LOADING if the component state is still initializing after the cutoff time", () => {
        jasmine.clock().install();

        fixture.detectChanges();

        jasmine.clock().tick(component.initializingTimeout);

        expect(component.componentState).toBe(StateEnum.LOADING);
      });

      it("should not set the component state to LOADING if the component state is ready before the cutoff time", () => {
        spyOnProperty(
          groupManagerService,
          "componentState$",
          "get",
        ).and.returnValue(of(StateEnum.READY));

        fixture.detectChanges();

        expect(component.componentState).toBe(StateEnum.READY);
      });
    });

    describe("initializing component state stream", () => {
      it("sets the component state to the component states streamed by group manager service", () => {
        spyOnProperty(
          groupManagerService,
          "componentState$",
          "get",
        ).and.returnValue(
          of(StateEnum.INITIALIZING, StateEnum.RETRYING, StateEnum.READY),
        );

        fixture.detectChanges();

        expect(component.componentState).toBe(StateEnum.READY);
      });

      it("should set the groups loaded flag to true if the component state is ready", () => {
        expect(component.isGroupsLoaded).toBeFalse();

        spyOnProperty(
          groupManagerService,
          "componentState$",
          "get",
        ).and.returnValue(of(StateEnum.READY));

        fixture.detectChanges();

        expect(component.isGroupsLoaded).toBeTrue();
      });
    });

    describe("initializing group state stream", () => {
      it("should set the synced text and groups synced flags to true if the group state is ready", () => {
        component.syncedText = false;
        component.isGroupsSynced = false;

        spyOnProperty(
          groupManagerService,
          "groupState$",
          "get",
        ).and.returnValue(of(StateEnum.READY));

        fixture.detectChanges();

        expect(component.syncedText).toBeTrue();
        expect(component.isGroupsSynced).toBeTrue();
      });

      it("should set the synced text and groups synced flags to false if the group state is not ready", () => {
        component.syncedText = true;
        component.isGroupsSynced = true;

        spyOnProperty(
          groupManagerService,
          "groupState$",
          "get",
        ).and.returnValue(of(StateEnum.LOADING));

        fixture.detectChanges();

        expect(component.syncedText).toBeFalse();
        expect(component.isGroupsSynced).toBeFalse();
      });

      it("should update the next retry if the group state is retrying and show the retrying component", () => {
        spyOnProperty(
          groupManagerService,
          "groupState$",
          "get",
        ).and.returnValue(of(StateEnum.RETRYING));

        spyOnProperty(
          groupManagerService,
          "streamRetryTime",
          "get",
        ).and.returnValue(of(3, 2, 1));

        fixture.detectChanges();

        expect(component.nextRetry).toBe(1);
      });
    });
  });

  describe("component state", () => {
    it("should not show any components if the component state is initializing", () => {
      fixture.detectChanges();
      component.componentState = StateEnum.INITIALIZING;
      fixture.detectChanges();

      expect(page.isActiveLoadingComponentVisible).toBeFalse();
      expect(page.isInactiveLoadingComponentVisible).toBeFalse();
      expect(page.isCardsComponentVisible).toBeFalse();
    });

    it("should show the active loading component if the component state is loading", () => {
      fixture.detectChanges();
      component.componentState = StateEnum.LOADING;
      fixture.detectChanges();

      expect(page.isActiveLoadingComponentVisible).toBeTrue();
      expect(page.isInactiveLoadingComponentVisible).toBeFalse();
      expect(page.isCardsComponentVisible).toBeFalse();
    });

    it("should show the inactive loading component if the component state is retrying", () => {
      fixture.detectChanges();
      component.componentState = StateEnum.RETRYING;
      fixture.detectChanges();

      expect(page.isActiveLoadingComponentVisible).toBeFalse();
      expect(page.isInactiveLoadingComponentVisible).toBeTrue();
      expect(page.isCardsComponentVisible).toBeFalse();
    });

    it("should show the cards component if the component state is ready", () => {
      fixture.detectChanges();
      component.componentState = StateEnum.READY;
      fixture.detectChanges();

      expect(page.isActiveLoadingComponentVisible).toBeFalse();
      expect(page.isInactiveLoadingComponentVisible).toBeFalse();
      expect(page.isCardsComponentVisible).toBeTrue();
    });
  });

  describe("sync banner state", () => {
    it("should show the sync banner groups are loaded and the group state is not ready", () => {
      spyOnProperty(groupManagerService, "groupState", "get").and.returnValue(
        StateEnum.LOADING,
      );

      fixture.detectChanges();
      component.isGroupsLoaded = true;
      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeTrue();
    });

    it("should not show the sync banner component if the group state is ready", () => {
      spyOnProperty(groupManagerService, "groupState", "get").and.returnValue(
        StateEnum.READY,
      );
      fixture.detectChanges();

      component.componentState = StateEnum.READY;

      fixture.detectChanges();

      expect(page.isSyncBannerComponentVisible).toBeFalse();
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
      "[data-test='loading-component__retrying']",
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
