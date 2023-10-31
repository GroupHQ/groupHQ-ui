import { ComponentFixture } from "@angular/core/testing";
import { GroupsComponent } from "./groups.component";
import { GroupsModule } from "./groups.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("GroupsComponent", () => {
  let fixture: ComponentFixture<GroupsComponent>;
  let groupsComponent: GroupsComponent;

  beforeEach(() => {
    cy.mount(GroupsComponent, {
      imports: [GroupsModule, BrowserAnimationsModule],
      declarations: [GroupsComponent],
    }).then((component) => {
      fixture = component.fixture;
      groupsComponent = fixture.componentInstance;
    });
  });

  it("adds the component-container class to the component's root tag", () => {
    expect(groupsComponent).to.exist;
    expect(groupsComponent.classes).to.equal("component-container");
  });
});
