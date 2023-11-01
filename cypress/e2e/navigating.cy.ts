describe("Viewing content", () => {
  it("should navigate correctly using the default navigation bar", () => {
    cy.viewport("macbook-15", "portrait");

    function assertSharedElementsWith(contentId: string) {
      cy.get("[data-cy='nav-default']").should("exist").and("be.visible");
      cy.get(`[data-cy='${contentId}']`).should("exist").and("be.visible");
      cy.get("[data-cy='footer']").should("exist").and("be.visible");
    }

    cy.visit("/");
    cy.url().should("include", "/");
    assertSharedElementsWith("group-board");

    cy.get("[data-cy='about-tab-default']").click();
    cy.url().should("include", "/about");
    assertSharedElementsWith("about-container");

    cy.get("[data-cy='sources-tab-default']").click();
    cy.url().should("include", "/sources");
    assertSharedElementsWith("sources-container");

    cy.get("[data-cy='groups-tab-default']").click();
    cy.url().should("include", "/");
    assertSharedElementsWith("group-board");

    cy.get("[data-cy='about-tab-default']").click();
    assertSharedElementsWith("about-container");
    cy.get("[data-cy='site-title-default']").click();
    cy.url().should("include", "/");
    assertSharedElementsWith("group-board");
  });
});
