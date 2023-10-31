import { ComponentFixture } from "@angular/core/testing";
import { GroupCardComponent } from "./groupCard.component";
import { GroupsModule } from "./groups.module";
import { GroupDetailsDialogComponent } from "./dialogs/groupDetailsDialog.component";

describe("GroupCardComponent", () => {
  let fixture: ComponentFixture<GroupCardComponent>;
  let groupCardComponent: GroupCardComponent;

  beforeEach(() => {
    cy.mount(GroupCardComponent, {
      imports: [GroupsModule],
      declarations: [GroupCardComponent],
    }).then((component) => {
      fixture = component.fixture;
      groupCardComponent = fixture.componentInstance;
    });
  });

  it("creates the component", () => {
    expect(groupCardComponent).to.exist;
  });

  it("opens a dialog when clicked", () => {
    const dialogOpenSpy = cy.spy(groupCardComponent.dialog, "open");

    cy.get("[data-cy='group-card']").click();
    dialogOpenSpy.calledOnceWith(GroupDetailsDialogComponent);
  });
});
