import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogState,
} from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GroupDetailsDialogComponent } from "./groupDetailsDialog.component";
import { MemberModel } from "../../../model/member.model";
import { MemberStatusEnum } from "../../../model/enums/memberStatus.enum";
import { GroupStatusEnum } from "../../../model/enums/groupStatus.enum";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatListModule } from "@angular/material/list";
import { GroupManagerService } from "../../services/groupManager.service";
import { GroupModel } from "../../../model/group.model";
import { UserService } from "../../../services/user/user.service";
import { RsocketRequestsService } from "../../../services/network/rsocket/requests/rsocketRequests.service";
import { RsocketPrivateUpdateStreamService } from "../../../services/network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { cold, getTestScheduler } from "jasmine-marbles";
import { PrivateEventModel } from "../../../model/privateEvent.model";
import { v4 as uuidv4 } from "uuid";
import { AggregateTypeEnum } from "../../../model/enums/aggregateType.enum";
import { EventTypeEnum } from "../../../model/enums/eventType.enum";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";

const mockMember: MemberModel = {
  id: 1,
  username: "Test User",
  groupId: 1,
  memberStatus: MemberStatusEnum.ACTIVE,
  joinedDate: new Date().toISOString(),
  exitedDate: null,
};

const mockPrivateEvent: PrivateEventModel = {
  eventId: uuidv4(),
  aggregateId: 1,
  websocketId: uuidv4(),
  aggregateType: AggregateTypeEnum.GROUP,
  eventType: EventTypeEnum.MEMBER_LEFT,
  eventData: JSON.stringify(mockMember),
  eventStatus: EventStatusEnum.SUCCESSFUL,
  createdDate: new Date().toISOString(),
};

describe("GroupDetailsDialogComponent", () => {
  let component: GroupDetailsDialogComponent;
  let fixture: ComponentFixture<GroupDetailsDialogComponent>;
  let dialogRefStub: jasmine.SpyObj<MatDialogRef<GroupDetailsDialogComponent>>;
  let userService: jasmine.SpyObj<any>;
  let rsocketRequestsServiceSpy: jasmine.SpyObj<RsocketRequestsService>;
  let rsocketPrivateUpdateStreamServiceSpy: jasmine.SpyObj<RsocketPrivateUpdateStreamService>;
  let page: Page;

  const members: MemberModel[] = [
    new MemberModel(
      1,
      "Brooks Foley",
      1,
      MemberStatusEnum.ACTIVE,
      new Date().toISOString(),
      null,
    ),
    new MemberModel(
      2,
      "Test User",
      1,
      MemberStatusEnum.ACTIVE,
      new Date().toISOString(),
      null,
    ),
    new MemberModel(
      3,
      "Another User",
      1,
      MemberStatusEnum.ACTIVE,
      new Date().toISOString(),
      null,
    ),
  ];
  const group: GroupModel = new GroupModel(
    1,
    "Farming For Gold",
    "Let's meet at the Dwarven Mines south entrance.",
    6,
    new Date().toISOString(),
    new Date().toISOString(),
    "Test User",
    "Test User",
    1,
    GroupStatusEnum.ACTIVE,
    members,
  );

  beforeEach(async () => {
    dialogRefStub = jasmine.createSpyObj("MatDialogRef", ["close"]);

    userService = {
      get currentGroupId$() {
        return cold("a", { a: group.id });
      },
      get currentGroupId() {
        return group.id;
      },
    };

    rsocketRequestsServiceSpy = jasmine.createSpyObj("RsocketRequestsService", [
      "sendLeaveRequest",
    ]);
    rsocketPrivateUpdateStreamServiceSpy = jasmine.createSpyObj(
      "RsocketPrivateUpdateStreamService",
      ["initializePrivateUpdateStream"],
    );
    Object.defineProperty(
      rsocketPrivateUpdateStreamServiceSpy,
      "isPrivateUpdatesStreamReady",
      {
        get: () => true,
        configurable: true,
      },
    );
    Object.defineProperty(
      rsocketPrivateUpdateStreamServiceSpy,
      "privateUpdatesStream$",
      {
        get: () => cold("a", { a: mockPrivateEvent }),
        configurable: true,
      },
    );

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatListModule,
        GroupDetailsDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: group },
        { provide: UserService, useValue: userService },
        {
          provide: RsocketRequestsService,
          useValue: rsocketRequestsServiceSpy,
        },
        {
          provide: RsocketPrivateUpdateStreamService,
          useValue: rsocketPrivateUpdateStreamServiceSpy,
        },
        GroupManagerService,
      ],
    }).compileComponents();
  });

  describe("#timeSince", () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
    });

    it("should return singular hour description when time since is one hour", () => {
      const date = new Date();
      date.setHours(date.getHours() - 1);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("1 hour ago");
    });

    it("should return plural hour description when time since is multiple hours", () => {
      const date = new Date();
      date.setHours(date.getHours() - 2);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("2 hours ago");
    });

    it("should return singular minute description when time since is one minute", () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 1);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("1 minute ago");
    });

    it("should return plural minute description when time since is multiple minutes", () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 2);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("2 minutes ago");
    });

    it("should return singular second description when time since is one second", () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - 1);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("1 second ago");
    });

    it("should return plural second description when time since is multiple seconds", () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - 2);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("2 seconds ago");
    });

    it("should return zero seconds ago when time since is negative", () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 1);
      const timeSince = component.timeSince(date.toISOString());
      expect(timeSince).toBe("0 seconds ago");
    });
  });

  describe("group details", () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new Page(fixture);
    });

    it("creates the component", () => {
      expect(component).toBeTruthy();
    });

    it("should display the group details", () => {
      expect(page.title?.textContent).toContain("Farming For Gold");
      expect(page.description?.textContent).toContain(
        "Let's meet at the Dwarven Mines south entrance.",
      );
      expect(page.membersCount?.textContent).toContain("3 / 6");
    });

    it("should allow the user to close the group details dialog", () => {
      component.onNoClick();
      expect(dialogRefStub.close.calls.count()).toBe(1);
    });

    it("should display all the group members", () => {
      const members = page.members;

      expect(members.length).toBe(3);
      expect(members[0].textContent).toContain("Brooks Foley");
      expect(members[1].textContent).toContain("Test User");
      expect(members[2].textContent).toContain("Another User");
    });

    it("should update the group members when the group is updated", () => {
      component.group = new GroupModel(
        1,
        "Farming For Gold",
        "Let's meet at the Dwarven Mines south entrance.",
        6,
        new Date().toISOString(),
        new Date().toISOString(),
        "Test User",
        "Test User",
        1,
        GroupStatusEnum.ACTIVE,
        [
          new MemberModel(
            1,
            "Brooks Foley",
            1,
            MemberStatusEnum.ACTIVE,
            new Date().toISOString(),
            null,
          ),
          new MemberModel(
            2,
            "Test User",
            1,
            MemberStatusEnum.ACTIVE,
            new Date().toISOString(),
            null,
          ),
          new MemberModel(
            3,
            "Another User",
            1,
            MemberStatusEnum.ACTIVE,
            new Date().toISOString(),
            null,
          ),
          new MemberModel(
            4,
            "New User",
            1,
            MemberStatusEnum.ACTIVE,
            new Date().toISOString(),
            null,
          ),
        ],
      );
      fixture.detectChanges();

      expect(page.membersCount?.textContent).toContain("4 / 6");

      const members = page.members;

      expect(members.length).toBe(4);
      expect(members[0].textContent).toContain("Brooks Foley");
      expect(members[1].textContent).toContain("Test User");
      expect(members[2].textContent).toContain("Another User");
      expect(members[3].textContent).toContain("New User");
    });
  });

  describe("group actions", () => {
    function createAndFlushComponent() {
      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      getTestScheduler().flush();
      fixture.detectChanges();
      page = new Page(fixture);
    }

    it("should show the join group button when the user is not part of the group", () => {
      Object.defineProperty(userService, "currentGroupId", {
        get: () => null,
      });

      createAndFlushComponent();

      expect(page.actionButtonType).toBe(ActionStates.JOIN_GROUP);
    });

    it("should disable the join group button when the user is already part of another group", () => {
      Object.defineProperty(userService, "currentGroupId", {
        get: () => component.group.id + 1,
      });

      createAndFlushComponent();

      expect(page.actionButtonType).toBe(ActionStates.IN_ANOTHER_GROUP);
      expect(page.isActionButtonDisabled).toBeTrue();
    });

    it("should disable the join group button when the group is full", () => {
      const updatedGroup = new GroupModel(
        1,
        "Farming For Gold",
        "Let's meet at the Dwarven Mines south entrance.",
        3,
        new Date().toISOString(),
        new Date().toISOString(),
        "Test User",
        "Test User",
        1,
        GroupStatusEnum.ACTIVE,
        members,
      );

      Object.defineProperty(userService, "currentGroupId", {
        get: () => null,
      });

      createAndFlushComponent();
      component.group = updatedGroup;
      fixture.detectChanges();

      expect(page.actionButtonType).toBe(ActionStates.GROUP_FULL);
      expect(page.isActionButtonDisabled).toBeTrue();
    });

    it("should open the input dialog when the user clicks the join group button", () => {
      Object.defineProperty(userService, "currentGroupId", {
        get: () => null,
      });

      createAndFlushComponent();

      expect(page.actionButtonType).toBe(ActionStates.JOIN_GROUP);
      page.clickActionButton();

      expect(component.inputNameDialogRef).toBeTruthy();
    });

    it("should close the input dialog when the user joins a group", () => {
      Object.defineProperty(userService, "currentGroupId", {
        get: () => null,
      });

      Object.defineProperty(userService, "currentGroupId$", {
        get: () => cold("a", { a: 1 }),
      });

      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new Page(fixture);

      expect([MatDialogState.CLOSED, undefined, null]).toContain(
        component.inputNameDialogRef?.getState(),
      );

      expect(page.actionButtonType).toBe(ActionStates.JOIN_GROUP);
      page.clickActionButton();

      expect(component.inputNameDialogRef?.getState()).toBe(
        MatDialogState.OPEN,
      );

      getTestScheduler().flush();
      expect(component.inputNameDialogRef?.getState()).toBeTruthy();
      expect([MatDialogState.CLOSING, MatDialogState.CLOSED]).toContain(
        component.inputNameDialogRef!.getState(),
      );
    });

    it("should show a loading indicator when the user is leaving the group", () => {
      createAndFlushComponent();

      expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
      page.clickActionButton();

      expect(component.loading).toBeTrue();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeTrue();
    });

    it("should show the leave group button when the user is part of the group", () => {
      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new Page(fixture);

      expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
      expect(page.isActionButtonDisabled).toBeFalse();
      expect(component.loading).toBeFalse();

      page.clickActionButton();

      expect(component.loading).toBeTrue();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeTrue();

      getTestScheduler().flush();
      expect(component.loading).toBeFalse();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeFalse();
    });

    it("should show an error message if the leave request fails", () => {
      Object.defineProperty(
        rsocketPrivateUpdateStreamServiceSpy,
        "privateUpdatesStream$",
        {
          get: () =>
            cold("a", {
              a: {
                ...mockPrivateEvent,
                eventStatus: EventStatusEnum.FAILED,
              },
            }),
        },
      );

      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new Page(fixture);

      expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
      expect(page.isActionButtonDisabled).toBeFalse();
      expect(component.loading).toBeFalse();

      page.clickActionButton();

      expect(component.loading).toBeTrue();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeTrue();

      getTestScheduler().flush();
      expect(component.loading).toBeFalse();
      expect(component.errorLeavingGroup).toBeTrue();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeFalse();
      expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
      expect(page.isServerUnavailableErrorVisible).toBeTrue();
    });

    it("should show an error message if the leave request times out", () => {
      jasmine.clock().install();
      createAndFlushComponent();

      page.clickActionButton();

      expect(component.loading).toBeTrue();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeTrue();

      jasmine.clock().tick(component.timeout + 1);

      expect(component.loading).toBeFalse();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeFalse();

      jasmine.clock().uninstall();
    });

    it("should save the subscription and close it after receiving a response", () => {
      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new Page(fixture);
      page.clickActionButton();

      expect(component.privateUpdateStreamSubscription).toBeTruthy();
      expect(component.privateUpdateStreamSubscription?.closed).toBeFalse();

      getTestScheduler().flush();

      expect(component.privateUpdateStreamSubscription?.closed).toBeTrue();
    });

    it("should unsubscribe from the subscription when the timeout is reached", () => {
      jasmine.clock().install();

      fixture = TestBed.createComponent(GroupDetailsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new Page(fixture);
      page.clickActionButton();

      expect(component.privateUpdateStreamSubscription).toBeTruthy();
      expect(component.privateUpdateStreamSubscription?.closed).toBeFalse();

      jasmine.clock().tick(component.timeout + 1);

      expect(component.privateUpdateStreamSubscription?.closed).toBeTrue();

      jasmine.clock().uninstall();
    });
  });
});

enum ActionStates {
  JOIN_GROUP = "Join Group",
  LEAVE_GROUP = "Leave Group",
  GROUP_FULL = "Group is full",
  IN_ANOTHER_GROUP = "You're already in another group",
}

class Page {
  private _element: HTMLElement;

  constructor(fixture: ComponentFixture<GroupDetailsDialogComponent>) {
    this._element = fixture.nativeElement;
  }

  public clickActionButton() {
    const actionButton = this._element.querySelector<HTMLElement>(
      '[data-test="group-details-action-dialog-button"]',
    );

    if (!actionButton) {
      throw new Error("Action button not found");
    }

    actionButton.click();
  }

  get actionButtonType(): ActionStates {
    const actionButton = this._element.querySelector(
      '[data-test="group-details-action-dialog-button"]',
    );

    if (!actionButton) {
      throw new Error("Action button not found");
    }

    switch (actionButton.textContent?.trim()) {
      case ActionStates.JOIN_GROUP:
        return ActionStates.JOIN_GROUP;
      case ActionStates.LEAVE_GROUP:
        return ActionStates.LEAVE_GROUP;
      case ActionStates.GROUP_FULL:
        return ActionStates.GROUP_FULL;
      case ActionStates.IN_ANOTHER_GROUP:
        return ActionStates.IN_ANOTHER_GROUP;
      default:
        throw new Error(
          `Unknown action button text: ${actionButton.textContent}`,
        );
    }
  }

  get isActionButtonDisabled(): boolean {
    const actionButton = this._element.querySelector(
      '[data-test="group-details-action-dialog-button"]',
    );

    if (!actionButton) {
      throw new Error("Action button not found");
    }

    return actionButton.hasAttribute("disabled");
  }

  get title(): HTMLElement | null {
    return this._element.querySelector('[data-test="group-title"]');
  }

  get description(): HTMLElement | null {
    return this._element.querySelector('[data-test="group-description"]');
  }

  get membersCount(): HTMLElement | null {
    return this._element.querySelector('[data-test="group-members-count"]');
  }

  get members(): NodeListOf<HTMLElement> {
    return this._element.querySelectorAll('[data-test="group-member"]');
  }

  get isLoadingVisible(): boolean {
    const loadingElement = this._element.querySelector<HTMLElement>(
      "[data-test='loading-progress-bar']",
    );

    return loadingElement !== null;
  }

  get isServerUnavailableErrorVisible(): boolean {
    const errorElement = this._element.querySelector<HTMLElement>(
      "[data-test='server-unavailable-error']",
    );

    return errorElement !== null;
  }
}
