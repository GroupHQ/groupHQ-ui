import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupsComponent } from "./groups.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Component } from "@angular/core";
@Component({
  selector: "app-group-utility-bar",
  template: "",
})
class GroupUtilityBarStubComponent {}

@Component({
  selector: "app-group-board",
  template: "",
})
class GroupBoardStubComponent {}

describe("GroupsComponent", () => {
  let fixture: ComponentFixture<GroupsComponent>;
  let groupsComponent: GroupsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [
        GroupsComponent,
        GroupUtilityBarStubComponent,
        GroupBoardStubComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsComponent);
    groupsComponent = fixture.componentInstance;
  });

  it("creates the component", () => {
    expect(groupsComponent).toBeTruthy();
  });

  it("adds the component-container class to the component's root tag", () => {
    expect(groupsComponent).toBeTruthy();
    expect(groupsComponent.classes).toEqual("component-container");
  });

  it("it adds the group-board-container class to the app-group-board tag", () => {
    const appGroupBoard: HTMLElement =
      fixture.nativeElement.querySelector("app-group-board");

    expect(appGroupBoard).toBeTruthy();
    expect(appGroupBoard.classList).toContain("group-board-container");
  });
});
