import { GroupInputNameDialogComponent } from "./groupInputNameDialog.component";
import { ComponentFixture } from "@angular/core/testing";
import { stub } from "sinon";
import { MatDialogRef } from "@angular/material/dialog";
import { GroupsModule } from "../groups.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("GroupInputNameDialogComponent", () => {
  let fixture: ComponentFixture<GroupInputNameDialogComponent>;
  let groupInputNameDialogComponent: GroupInputNameDialogComponent;

  const dialogRefMockObj = {
    close: stub(),
  };

  beforeEach(() => {
    cy.mount(GroupInputNameDialogComponent, {
      imports: [GroupsModule, BrowserAnimationsModule],
      declarations: [GroupInputNameDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRefMockObj }],
    }).then((component) => {
      fixture = component.fixture;
      groupInputNameDialogComponent = fixture.componentInstance;
    });
  });

  it("creates the component", () => {
    expect(groupInputNameDialogComponent).to.exist;
  });

  it("should let the user submit their name", () => {
    const joinGroupSpy = cy.spy(groupInputNameDialogComponent, "joinGroup");

    cy.get("[data-cy='join-group-button']").should("be.disabled");
    cy.get("[data-cy='member-name-input']").type("Test User");
    cy.get("[data-cy='name-input-error']").should("not.exist");
    cy.get("[data-cy='join-group-button']").should("not.be.disabled");
    cy.get("[data-cy='join-group-button']").click();
    cy.get("[data-cy='name-input-error']").should("not.exist");

    cy.then(() => {
      expect(joinGroupSpy.calledOnce).to.be.true;
      expect(dialogRefMockObj.close.calledOnce).to.be.true;
    });
  });

  it("should not let the user submit their name until errors are cleared", () => {
    const joinGroupSpy = cy.spy(groupInputNameDialogComponent, "joinGroup");

    cy.get("[data-cy='member-name-input']").clear();
    cy.get("[data-cy='join-group-button']").should("be.disabled");

    cy.get("[data-cy='member-name-input']").focus();
    cy.get("[data-cy='member-name-input']").blur();
    cy.get("[data-cy='name-input-error']")
      .should("exist")
      .and("have.text", "Name is required");

    cy.get("[data-cy='member-name-input']").type("Test User");
    cy.get("[data-cy='name-input-error']").should("not.exist");
    cy.get("[data-cy='join-group-button']").should("not.be.disabled");
    cy.get("[data-cy='join-group-button']").click();
    cy.get("[data-cy='name-input-error']").should("not.exist");

    cy.then(() => {
      expect(joinGroupSpy.calledOnce).to.be.true;
      expect(dialogRefMockObj.close.calledTwice).to.be.true;
    });
  });
});
