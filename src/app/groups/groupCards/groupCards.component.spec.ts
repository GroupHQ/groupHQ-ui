import { Component, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupCardsComponent } from "./groupCards.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GroupModel } from "../../model/group.model";
import { trigger } from "@angular/animations";
import { AppMediaBreakpointDirective } from "../../shared/directives/attr.breakpoint";

@Component({
  standalone: true,
  selector: "app-group-card",
  template: "",
})
class GroupCardStubComponent {
  @Input() group!: GroupModel;
}

@Component({
  template: `<app-group-cards
    [groups]="groups"
    [isGroupsSynced]="isGroupsSynced"
    (groupCards)="setCards()"
  ></app-group-cards>`,
  standalone: true,
  imports: [GroupCardStubComponent, GroupCardsComponent],
})
class TestHostComponent {
  groups: GroupModel[] = [
    {
      id: 1,
      title: "Group 1",
      description: "Group 1 description",
      status: "ACTIVE",
      maxGroupSize: 10,
      lastModifiedDate: Date.now().toString(),
      lastModifiedBy: "Test User 1",
      createdDate: Date.now().toString(),
      createdBy: "Test User 1",
      version: 1,
      members: [],
    },
    {
      id: 2,
      title: "Group 2",
      description: "Group 2 description",
      status: "ACTIVE",
      maxGroupSize: 10,
      lastModifiedDate: Date.now().toString(),
      lastModifiedBy: "Test User 2",
      createdDate: Date.now().toString(),
      createdBy: "Test User 2",
      version: 1,
      members: [],
    },
  ];
  isGroupsSynced = false;

  setCards() {}
}

describe("GroupCardsComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestHostComponent, GroupCardsComponent],
    })
      .overrideComponent(GroupCardsComponent, {
        set: {
          imports: [GroupCardStubComponent, AppMediaBreakpointDirective],
          animations: [
            trigger("groupBoardAnimation", []),
            trigger("groupBoardNoGroupsMessage", []),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    page = new Page(fixture);
    testHost = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("creates the component", () => {
    expect(testHost).toBeTruthy();
  });

  describe("groups exist state", () => {
    it("renders the group cards when there exists at least one group", () => {
      expect(testHost.groups.length).toBeGreaterThan(0);
      expect(page.groupCardsContainer).toBeTruthy();
      expect(page.noGroupsMessageContainer).toBeFalsy();
    });
  });

  describe("no groups state", () => {
    beforeEach(() => {
      testHost.groups = [];
      fixture.detectChanges();
    });

    it("renders the no groups message elements when there are no groups", () => {
      expect(page.groupCardsContainer).toBeFalsy();
      expect(page.noGroupsMessageContainer).toBeTruthy();
    });

    it("should render the no groups message whether synced or not", () => {
      testHost.isGroupsSynced = true;
      fixture.detectChanges();
      expect(page.noGroupsMessage).toBeTruthy();

      testHost.isGroupsSynced = false;
      fixture.detectChanges();
      expect(page.noGroupsMessage).toBeTruthy();
    });

    it("should render the additional sync message when the groups are synced", () => {
      testHost.isGroupsSynced = true;
      fixture.detectChanges();
      expect(page.noGroupsMessageSyncedText).toBeTruthy();
    });

    it("should not render the additional sync message when the groups are not synced", () => {
      testHost.isGroupsSynced = false;
      fixture.detectChanges();
      expect(page.noGroupsMessageSyncedText).toBeFalsy();
    });
  });

  it("renders the no groups message elements when there are no groups", () => {
    testHost.groups = [];
    fixture.detectChanges();
    expect(page.groupCardsContainer).toBeFalsy();
    expect(page.noGroupsMessageContainer).toBeTruthy();
  });
});

class Page {
  private readonly _testHostComponent: HTMLElement;

  constructor(readonly fixture: ComponentFixture<TestHostComponent>) {
    this._testHostComponent = fixture.nativeElement;
  }

  get testHostComponent() {
    return this._testHostComponent;
  }

  get groupCardsContainer() {
    return this.testHostComponent.querySelector<HTMLElement>(
      '[data-test="group-cards"]',
    );
  }

  get noGroupsMessageContainer() {
    return this.testHostComponent.querySelector<HTMLElement>(
      '[data-test="group-cards--no-groups-message"]',
    );
  }

  get noGroupsMessage() {
    return this.testHostComponent.querySelector(
      '[data-test="no-groups-message__text"]',
    );
  }

  get noGroupsMessageSyncedText() {
    return this.testHostComponent.querySelector(
      '[data-test="no-groups-message__sync-text"]',
    );
  }
}
