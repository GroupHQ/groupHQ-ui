import { GroupDetailsDialogComponent } from "./groupDetailsDialog.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogState,
} from "@angular/material/dialog";
import { AsynchronousRequestMediator } from "../../../services/notifications/asynchronousRequest.mediator";
import { UserService } from "../../../services/user/user.service";
import { ConfigService } from "../../../config/config.service";
import { GroupModel } from "../../../model/group.model";
import { MemberModel } from "../../../model/member.model";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { NEVER } from "rxjs";
import { GroupManagerService } from "../../services/groupManager.service";

describe("GroupDetailsDialogComponent", () => {
  let component: GroupDetailsDialogComponent;
  let fixture: ComponentFixture<GroupDetailsDialogComponent>;
  let dialogRefStub: jasmine.SpyObj<MatDialogRef<GroupDetailsDialogComponent>>;
  let userService: UserService;
  let groupManagerService: GroupManagerService;
  let asyncRequestMediator: AsynchronousRequestMediator;
  let page: Page;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    const members: Partial<MemberModel>[] = [
      { username: "Brooks Foley" },
      { username: "Test User" },
      { username: "Another User" },
    ];
    const group: Partial<GroupModel> = {
      id: 1,
      title: "Farming For Gold",
      description: "Let's meet at the Dwarven Mines south entrance.",
      maxGroupSize: 6,
      members: members as MemberModel[],
    };

    dialogRefStub = jasmine.createSpyObj("MatDialogRef", ["close"]);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: group },
        { provide: ConfigService, useValue: {} },
      ],
    });

    fixture = TestBed.createComponent(GroupDetailsDialogComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    groupManagerService = TestBed.inject(GroupManagerService);
    asyncRequestMediator = TestBed.inject(AsynchronousRequestMediator);
    page = new Page(fixture);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("group details", () => {
    it("should display the group details", () => {
      fixture.detectChanges();

      expect(page.title?.textContent).toContain("Farming For Gold");
      expect(page.description?.textContent).toContain(
        "Let's meet at the Dwarven Mines south entrance.",
      );
      expect(page.membersCount?.textContent).toContain("3 / 6");
    });

    it("should allow the user to close the group details dialog", () => {
      page.clickCloseButton();
      expect(dialogRefStub.close.calls.count()).toBe(1);
    });

    it("should display all the group members", () => {
      fixture.detectChanges();

      const members = page.members;

      expect(members.length).toBe(3);
      expect(members[0].textContent).toContain("Brooks Foley");
      expect(members[1].textContent).toContain("Test User");
      expect(members[2].textContent).toContain("Another User");
    });

    it("should update the group members when the group is updated", () => {
      const newMember: Partial<MemberModel> = { username: "New User" };
      component.group = {
        ...component.group,
        members: [...component.group.members, newMember as MemberModel],
      };

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

  describe("group updates", () => {
    it("should keep the group up to date via group manager service", () => {
      testScheduler.run(({ cold, flush }) => {
        const updatedGroup: Partial<GroupModel> = {
          ...component.group,
          title: "New Title",
        };

        spyOnProperty(groupManagerService, "groups$", "get").and.returnValue(
          cold("a", { a: [{} as any, {} as any, updatedGroup] }),
        );

        fixture.detectChanges();

        expect(page.title?.textContent).toContain("Farming For Gold");

        flush();

        fixture.detectChanges();

        expect(page.title?.textContent).toContain("New Title");
      });
    });
  });

  describe("group actions", () => {
    it("should show the join group button when the user is not part of the group", () => {
      userService.removeUserFromGroup();

      fixture.detectChanges();

      expect(page.actionButtonType).toBe(ActionStates.JOIN_GROUP);
    });

    it("should disable the join group button when the user is already part of another group", () => {
      userService.setUserInGroup(component.group.id + 1, 1);

      fixture.detectChanges();

      expect(page.actionButtonType).toBe(ActionStates.IN_ANOTHER_GROUP);
      expect(page.isActionButtonDisabled).toBeTrue();
    });

    it("should disable the join group button when the group is full", () => {
      const members: Partial<MemberModel>[] = Array.from(
        { length: component.group.maxGroupSize },
        (_, i) => ({
          username: `User ${i + 1}`,
        }),
      );

      component.group = {
        ...component.group,
        members: members as MemberModel[],
      };
      userService.removeUserFromGroup();

      fixture.detectChanges();
      expect(page.actionButtonType).toBe(ActionStates.GROUP_FULL);
      expect(page.isActionButtonDisabled).toBeTrue();
    });

    it("should open the input dialog when the user clicks the join group button", () => {
      userService.removeUserFromGroup();

      fixture.detectChanges();

      expect(page.actionButtonType).toBe(ActionStates.JOIN_GROUP);
      page.clickActionButton();

      expect(component.inputNameDialogRef).toBeTruthy();
    });

    it("should close the input dialog when the user joins a group", () => {
      // Dialog should be closed by default
      expect([MatDialogState.CLOSED, undefined, null]).toContain(
        component.inputNameDialogRef?.getState(),
      );

      userService.removeUserFromGroup();

      testScheduler.run(({ cold, flush }) => {
        spyOnProperty(userService, "currentGroupId$", "get").and.returnValue(
          cold("a", { a: component.group.id }),
        );

        fixture.detectChanges();

        expect(page.actionButtonType).toBe(ActionStates.JOIN_GROUP);
        page.clickActionButton();

        expect(component.inputNameDialogRef?.getState()).toBe(
          MatDialogState.OPEN,
        );

        flush();

        fixture.detectChanges();

        expect(component.inputNameDialogRef?.getState()).toBeTruthy();
        expect([MatDialogState.CLOSING, MatDialogState.CLOSED]).toContain(
          component.inputNameDialogRef!.getState(),
        );
      });
    });

    it("should show the leave group button when the user is part of the group", () => {
      userService.setUserInGroup(component.group.id, 1);
      fixture.detectChanges();

      expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
      expect(page.isActionButtonDisabled).toBeFalse();
      expect(component.loading).toBeFalse();
    });

    it("should show a loading indicator when the user is leaving the group", () => {
      spyOn(asyncRequestMediator, "submitRequestEvent").and.returnValue(NEVER);
      userService.setUserInGroup(component.group.id, 1);
      fixture.detectChanges();

      expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
      page.clickActionButton();

      expect(component.loading).toBeTrue();
      fixture.detectChanges();
      expect(page.isLoadingVisible).toBeTrue();
    });

    it("should set loading to false when the leave request completes", () => {
      userService.setUserInGroup(component.group.id, 1);
      fixture.detectChanges();

      testScheduler.run(({ cold, flush }) => {
        spyOn(asyncRequestMediator, "submitRequestEvent").and.returnValue(
          cold("|"),
        );

        expect(page.actionButtonType).toBe(ActionStates.LEAVE_GROUP);
        page.clickActionButton();

        expect(component.loading).toBeTrue();
        fixture.detectChanges();
        expect(page.isLoadingVisible).toBeTrue();

        flush();

        expect(component.loading).toBeFalse();
        fixture.detectChanges();
        expect(page.isLoadingVisible).toBeFalse();
      });
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

  public clickCloseButton() {
    const closeButton = this._element.querySelector<HTMLElement>(
      '[data-test="close-group-details-dialog-button"]',
    );

    if (!closeButton) {
      throw new Error("Close button not found");
    }

    closeButton.click();
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
}
