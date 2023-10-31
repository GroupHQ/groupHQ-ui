import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GroupDetailsDialogComponent } from "./groupDetailsDialog.component";
import { GroupsModule } from "../groups.module";
import { ComponentFixture } from "@angular/core/testing";
import { stub } from "sinon";
import { MatDialogRef } from "@angular/material/dialog";
import { GroupInputNameDialogComponent } from "./groupInputNameDialog.component";

describe("GroupDetailsDialogComponent", () => {
  let fixture: ComponentFixture<GroupDetailsDialogComponent>;
  let groupDetailsDialogComponent: GroupDetailsDialogComponent;

  const groupDetailsDialogRef = {
    close: stub(),
  };

  beforeEach(() => {
    cy.mount(GroupDetailsDialogComponent, {
      imports: [GroupsModule, BrowserAnimationsModule],
      declarations: [GroupDetailsDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: groupDetailsDialogRef }],
    }).then((component) => {
      fixture = component.fixture;
      groupDetailsDialogComponent = fixture.componentInstance;
    });
  });

  it("creates the component", () => {
    expect(groupDetailsDialogComponent).to.exist;
  });

  describe("group details", () => {
    it("should display the group title", () => {
      cy.get("[data-cy='group-title']").should(
        "contain.text",
        "Farming For Gold",
      );
    });

    it("should display the group description", () => {
      cy.get("[data-cy='group-description']").should(
        "contain.text",
        "Let's meet at the Dwarven Mines south entrance.",
      );
    });

    it("should display the group's last activity time", () => {
      cy.get("[data-cy='group-last-activity']").should(
        "contain.text",
        "5 minutes ago",
      );
    });

    it("should display the group's creation time", () => {
      cy.get("[data-cy='group-creation-time']").should(
        "contain.text",
        "10 minutes ago",
      );
    });

    it("should display the number of group members", () => {
      cy.get("[data-cy='group-members-count']").should("contain.text", "3 / 6");
    });
  });

  describe("group members list", () => {
    it("should display all the group members", () => {
      cy.get("[data-cy='group-member']")
        .should("have.length", 3)
        .each((member) => {
          expect(member)
            .to.have.descendants("mat-icon")
            .and.to.contain.text("Brooks Foley")
            .and.to.contain.text("Joined 5 minutes ago");
        });
    });
  });

  describe("group actions", () => {
    it("should allow the user to close the group details dialog", () => {
      cy.get("[data-cy='close-group-details-dialog-button']")
        .should("exist")
        .and("contain.text", "Close")
        .and("not.be.disabled");

      cy.get("[data-cy='close-group-details-dialog-button']").click();
      cy.then(() => {
        expect(groupDetailsDialogRef.close.calledOnce).to.be.true;
      });
    });

    it("should allow the user to join the group", () => {
      const inputNameDialogOpenSpy = cy.spy(
        groupDetailsDialogComponent.dialog,
        "open",
      );

      cy.get("[data-cy='group-details-join-dialog-button']")
        .should("exist")
        .and("contain.text", "Join")
        .and("not.be.disabled");

      cy.get("[data-cy='group-details-join-dialog-button']").click();
      inputNameDialogOpenSpy.calledOnceWith(GroupInputNameDialogComponent);
    });
  });
});
