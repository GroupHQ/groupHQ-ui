describe("Groups Page", () => {
  it("Should allow a user to join a group", () => {
    cy.viewport("macbook-15", "portrait");
    cy.visit("/");
    cy.get("[data-cy='group-card']").should("have.length", 8);

    cy.get("[data-cy='group-card']").first().click();

    cy.get("[data-cy='group-details-dialog']")
      .should("exist")
      .and("be.visible");
    cy.get("[data-cy='group-details-join-dialog-button']").click();

    cy.get("[data-cy='group-input-name-dialog']")
      .should("exist")
      .and("be.visible");
    cy.get("[data-cy='join-group-button']").should("be.disabled");
    cy.get("[data-cy='member-name-input']").type("Test User");
    cy.get("[data-cy='join-group-button']").should("not.be.disabled");

    cy.get("[data-cy='join-group-button']").click();
    cy.get("[data-cy='group-input-name-dialog']").should("not.exist");

    cy.contains("Successfully joined group!").should("exist").and("be.visible");
  });
});
