import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupCardComponent } from "./groupCard.component";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { GroupDetailsDialogComponent } from "../dialogs/groupDetailsDialog/groupDetailsDialog.component";
import { Component } from "@angular/core";
import { GroupModel } from "../../model/group.model";

@Component({
  template: `<app-group-card [group]="group"></app-group-card>`,
})
class TestHostComponent {
  group: GroupModel = {
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
  };
}

describe("GroupCardComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let dialog: MatDialog;
  let page: GroupCardPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupCardComponent, TestHostComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    page = new GroupCardPage(fixture);
    testHost = fixture.componentInstance;
    fixture.detectChanges();
    dialog = TestBed.inject(MatDialog);
  });

  it("creates the component", () => {
    expect(testHost).toBeTruthy();
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
    expect(element!.textContent).toContain("5");
  });

  it("has a group card with a max group size", () => {
    const element: HTMLElement | null = page.memberCountElement;
    expect(element).toBeTruthy();
    expect(element!.textContent).toContain("10");
  });

  it("opens a dialog when clicked", () => {
    const dialogOpenSpy = spyOn(dialog, "open");

    page.clickCard();
    fixture.detectChanges();

    expect(dialogOpenSpy).toHaveBeenCalledWith(
      GroupDetailsDialogComponent,
      jasmine.any(MatDialogConfig),
    );
  });
});

class GroupCardPage {
  private readonly _cardComponent: HTMLElement;

  constructor(private fixture: ComponentFixture<TestHostComponent>) {
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

  clickCard(): void {
    this._cardComponent.click();
    this.fixture.detectChanges();
  }
}
