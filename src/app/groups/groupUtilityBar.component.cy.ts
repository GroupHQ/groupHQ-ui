import { ComponentFixture } from "@angular/core/testing";
import { GroupUtilityBarComponent } from "./groupUtilityBar.component";
import { GroupsModule } from "./groups.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
describe("GroupUtilityBarComponent", () => {
  let fixture: ComponentFixture<GroupUtilityBarComponent>;
  let groupUtilityBarComponent: GroupUtilityBarComponent;

  beforeEach(() => {
    cy.mount(GroupUtilityBarComponent, {
      imports: [GroupsModule, BrowserAnimationsModule],
      declarations: [GroupUtilityBarComponent],
    }).then((component) => {
      fixture = component.fixture;
      groupUtilityBarComponent = fixture.componentInstance;
    });
  });

  it("creates the component", () => {
    expect(groupUtilityBarComponent).to.exist;
  });

  it("should set the selected to 'Oldest' by default", () => {
    expect(groupUtilityBarComponent.selected).to.equal("Oldest");
    cy.get("[data-cy='group-utility-bar-select']").should(
      "have.text",
      "Oldest",
    );
  });

  it("update the selected value based on the selection element value", () => {
    cy.get("[data-cy='group-utility-bar-select']").click();
    cy.get("[data-cy='group-utility-bar-select-option']")
      .contains("Newest")
      .click();
    cy.get("[data-cy='group-utility-bar-select']")
      .should("have.text", "Newest")
      .and("not.have.text", "Oldest");
  });
});
