import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NavComponent } from "./nav.component";
import { SharedModule } from "./shared.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";

describe("NavComponent", () => {
  let fixture: ComponentFixture<NavComponent>;
  let navComponentInstance: NavComponent;

  beforeEach(() => {
    cy.mount(NavComponent, {
      imports: [
        RouterTestingModule.withRoutes([
          { path: "", component: NavComponent },
          { path: "about", component: NavComponent },
          { path: "sources", component: NavComponent },
        ]),
        SharedModule,
        BrowserAnimationsModule,
      ],
      declarations: [NavComponent],
    }).then((component) => {
      fixture = component.fixture;
      navComponentInstance = fixture.componentInstance;
    });
  });

  it("should create the nav component", () => {
    expect(navComponentInstance).to.exist;
  });

  describe("#select", () => {
    it("should set the page to the selected page", () => {
      const page = "GROUPS";
      navComponentInstance.select(page);
      expect(navComponentInstance.page).to.be.equal(page);

      navComponentInstance.select(undefined);
      expect(navComponentInstance.page).to.be.undefined;
    });
  });

  describe("#getPageToLowercase", () => {
    it("should return the page in lowercase", () => {
      navComponentInstance.page = "GROUPS";
      expect(navComponentInstance.getPageToLowercase()).to.be.equal("groups");
    });
  });

  describe("#updateNav", () => {
    it("should update to compact when screen is small enough", () => {
      cy.viewport("ipad-mini", "landscape");

      cy.get("[data-cy='nav-compact']").should("exist");
      cy.get("[data-cy='nav-default']").should("not.exist");
    });

    it("should update to default size when screen is large enough", () => {
      cy.viewport("macbook-15", "landscape");

      cy.get("[data-cy='nav-default']").should("exist");
      cy.get("[data-cy='nav-compact']").should("not.exist");
    });
  });

  describe("toggleMenu", () => {
    it("should toggle the menu", () => {
      cy.viewport("ipad-mini", "landscape");

      const menuState = navComponentInstance.showMenu;
      navComponentInstance.toggleMenu();
      expect(navComponentInstance.showMenu).to.be.equal(!menuState);

      navComponentInstance.toggleMenu();
      expect(navComponentInstance.showMenu).to.be.equal(menuState);
    });
  });

  describe("site-name", () => {
    it("should navigate to the home page when the logo is clicked", () => {
      cy.viewport("macbook-15", "landscape");

      cy.get("[data-cy='site-title-default']")
        .click()
        .then(() => {
          expect(TestBed.inject(Router).url).to.be.equal("/");
        });

      cy.get("[data-cy='about-tab-default']")
        .click()
        .then(() => {
          expect(TestBed.inject(Router).url).to.be.equal("/about");
        });

      cy.get("[data-cy='site-title-default']")
        .click()
        .then(() => {
          expect(TestBed.inject(Router).url).to.be.equal("/");
        });
    });
  });

  describe("tabs", () => {
    describe("default nav", () => {
      beforeEach(() => {
        cy.viewport("macbook-15", "landscape");

        cy.get("[data-cy='nav-default']").should("exist");
        cy.get("[data-cy='nav-compact']").should("not.exist");
      });

      it("should navigate to the correct page when a tab is clicked on", () => {
        cy.get("[data-cy='groups-tab-default']")
          .click()
          .then((groupsTab) => {
            expect(groupsTab).to.have.class("mat-primary");
            cy.get("[data-cy='about-tab-default']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='sources-tab-default']").should(
              "not.have.class",
              "active",
            );

            expect(TestBed.inject(Router).url).to.be.equal("/");
          });

        cy.get("[data-cy='about-tab-default']")
          .click()
          .then((aboutTab) => {
            expect(aboutTab).to.have.class("active");
            cy.get("[data-cy='sources-tab-default']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='groups-tab-default']").should(
              "not.have.class",
              "mat-active",
            );

            expect(TestBed.inject(Router).url).to.be.equal("/about");
          });

        cy.get("[data-cy='sources-tab-default']")
          .click()
          .then((sourcesTab) => {
            expect(sourcesTab).to.have.class("active");
            cy.get("[data-cy='groups-tab-default']").should(
              "not.have.class",
              "mat-active",
            );
            cy.get("[data-cy='about-tab-default']").should(
              "not.have.class",
              "active",
            );

            expect(TestBed.inject(Router).url).to.be.equal("/sources");
          });
      });

      it("should highlight only the most recent clicked tab", () => {
        cy.get("[data-cy='about-tab-default']")
          .click()
          .then((aboutTab) => {
            expect(aboutTab).to.have.class("active");
            cy.get("[data-cy='groups-tab-default']").should(
              "not.have.class",
              "mat-primary",
            );
            cy.get("[data-cy='sources-tab-default']").should(
              "not.have.class",
              "active",
            );
          });

        cy.get("[data-cy='sources-tab-default']")
          .click()
          .then((sourcesTab) => {
            expect(sourcesTab).to.have.class("active");
            cy.get("[data-cy='groups-tab-default']").should(
              "not.have.class",
              "mat-primary",
            );
            cy.get("[data-cy='about-tab-default']").should(
              "not.have.class",
              "active",
            );
          });

        cy.get("[data-cy='groups-tab-default']")
          .click()
          .then((groupsTab) => {
            expect(groupsTab).to.have.class("mat-primary");
            cy.get("[data-cy='about-tab-default']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='sources-tab-default']").should(
              "not.have.class",
              "active",
            );
          });
      });
    });

    describe("dropdown nav (tablet and mobile sizes)", () => {
      beforeEach(() => {
        cy.viewport("ipad-mini", "landscape");

        cy.get("[data-cy='nav-compact']").should("exist");
        cy.get("[data-cy='nav-default']").should("not.exist");

        cy.get("[data-cy='dropdown-tab-list']").should("not.exist");
        cy.get("[data-cy='menu-icon']").click({ force: true });
        cy.get("[data-cy='dropdown-tab-list']").should("exist.and.be.visible");
      });

      it("should navigate to the correct page when a tab is clicked on", () => {
        cy.get("[data-cy='groups-tab-compact']")
          .click()
          .then((groupsTab) => {
            expect(groupsTab).to.have.class("active");
            cy.get("[data-cy='about-tab-compact']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='sources-tab-compact']").should(
              "not.have.class",
              "active",
            );

            expect(TestBed.inject(Router).url).to.be.equal("/");
          });

        cy.get("[data-cy='about-tab-compact']")
          .click()
          .then((aboutTab) => {
            expect(aboutTab).to.have.class("active");
            cy.get("[data-cy='sources-tab-compact']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='groups-tab-compact']").should(
              "not.have.class",
              "active",
            );

            expect(TestBed.inject(Router).url).to.be.equal("/about");
          });

        cy.get("[data-cy='sources-tab-compact']")
          .click()
          .then((sourcesTab) => {
            expect(sourcesTab).to.have.class("active");
            cy.get("[data-cy='groups-tab-compact']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='about-tab-compact']").should(
              "not.have.class",
              "active",
            );

            expect(TestBed.inject(Router).url).to.be.equal("/sources");
          });
      });

      it("should highlight only the most recent clicked tab", () => {
        cy.get("[data-cy='about-tab-compact']")
          .click()
          .then((aboutTab) => {
            expect(aboutTab).to.have.class("active");
            cy.get("[data-cy='groups-tab-compact']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='sources-tab-compact']").should(
              "not.have.class",
              "active",
            );
          });

        cy.get("[data-cy='sources-tab-compact']")
          .click()
          .then((sourcesTab) => {
            expect(sourcesTab).to.have.class("active");
            cy.get("[data-cy='groups-tab-compact']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='about-tab-compact']").should(
              "not.have.class",
              "active",
            );
          });

        cy.get("[data-cy='groups-tab-compact']")
          .click()
          .then((groupsTab) => {
            expect(groupsTab).to.have.class("active");
            cy.get("[data-cy='about-tab-compact']").should(
              "not.have.class",
              "active",
            );
            cy.get("[data-cy='sources-tab-compact']").should(
              "not.have.class",
              "active",
            );
          });
      });
    });
  });
});
