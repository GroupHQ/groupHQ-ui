import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupCardComponent } from "./groupCard.component";
import {
  MatDialog,
  MatDialogConfig,
  MatDialogState,
} from "@angular/material/dialog";
import { GroupDetailsDialogComponent } from "../dialogs/groupDetailsDialog/groupDetailsDialog.component";
import { GroupModel } from "../../model/group.model";
import { MemberModel } from "../../model/member.model";
import { UserService } from "../../services/user/user.service";
import { ConfigService } from "../../config/config.service";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe("GroupCardComponent", () => {
  let fixture: ComponentFixture<GroupCardComponent>;
  let component: GroupCardComponent;
  let dialog: MatDialog;
  let page: GroupCardPage;
  let userService: UserService;

  beforeEach(() => {
    const members: Partial<MemberModel>[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const group: Partial<GroupModel> = {
      id: 1,
      title: "Group 1",
      description: "Group 1 description",
      maxGroupSize: 10,
      members: members as MemberModel[],
    };

    TestBed.configureTestingModule({
      imports: [GroupCardComponent, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: {} }],
    });

    fixture = TestBed.createComponent(GroupCardComponent);
    component = fixture.componentInstance;
    component.group = group as GroupModel;
    userService = TestBed.inject(UserService);
    dialog = TestBed.inject(MatDialog);
    page = new GroupCardPage(fixture);

    fixture.detectChanges();
  });

  it("has a group card", () => {
    expect(page.cardComponent).toBeTruthy();
  });

  it("has a group card with a title", () => {
    const element: HTMLElement | null = page.titleElement;
    expect(element).toBeTruthy();
    expect(element!.textContent).toBe("Group 1");
  });

  it("has a group card with a description", () => {
    const element: HTMLElement | null = page.descriptionElement;
    expect(element).toBeTruthy();
    expect(element!.textContent).toBe("Group 1 description");
  });

  it("has a group card with a current group size", () => {
    const element: HTMLElement | null = page.memberCountElement;
    expect(element).toBeTruthy();
    expect(element!.textContent).toContain("3");
  });

  it("has a group card with a max group size", () => {
    const element: HTMLElement | null = page.memberCountElement;
    expect(element).toBeTruthy();
    expect(element!.textContent).toContain("10");
  });

  it("opens a dialog when clicked", () => {
    page.clickCard();
    fixture.detectChanges();

    expect(dialog.openDialogs.length).toBe(1);
  });

  it("opens a group details dialog when clicked", () => {
    const dialogOpenSpy = spyOn(dialog, "open").and.callThrough();

    page.clickCard();
    fixture.detectChanges();

    expect(dialogOpenSpy).toHaveBeenCalledWith(
      GroupDetailsDialogComponent,
      jasmine.any(MatDialogConfig),
    );
  });

  it("shows the 'your group' icon when the user is a member of the group", () => {
    userService.setUserInGroup(1, 1);
    fixture.detectChanges();

    expect(page.isYourGroupIconVisible).toBeTrue();
  });

  it("does not show the 'your group' icon when the user is not a member of the group", () => {
    userService.removeUserFromGroup();
    fixture.detectChanges();

    expect(page.isYourGroupIconVisible).toBeFalse();
  });

  it("should close the group details dialog if the group card is destroyed", () => {
    page.clickCard();
    fixture.detectChanges();

    expect(component.groupDetailsDialogRef?.getState()).toBe(
      MatDialogState.OPEN,
    );

    component.ngOnDestroy();

    expect(component.groupDetailsDialogRef?.getState()).toBeTruthy();
    expect([MatDialogState.CLOSING, MatDialogState.CLOSED]).toContain(
      component.groupDetailsDialogRef!.getState(),
    );
  });
});

class GroupCardPage {
  private readonly _cardComponent: HTMLElement;

  constructor(private fixture: ComponentFixture<GroupCardComponent>) {
    this._cardComponent = this.fixture.nativeElement.querySelector(
      '[data-test="group-card"]',
    );
  }

  get cardComponent() {
    return this._cardComponent;
  }

  get titleElement() {
    return this._cardComponent.querySelector<HTMLElement>(
      '[data-test="title"]',
    );
  }

  get descriptionElement() {
    return this._cardComponent.querySelector<HTMLElement>(
      '[data-test="description"]',
    );
  }

  get memberCountElement() {
    return this._cardComponent.querySelector<HTMLElement>(
      '[data-test="member-count"]',
    );
  }

  get isYourGroupIconVisible(): boolean {
    const element = this._cardComponent.querySelector<HTMLElement>(
      '[data-test="your-group-icon"]',
    );

    return element !== null;
  }

  clickCard(): void {
    this._cardComponent.click();
    this.fixture.detectChanges();
  }
}
