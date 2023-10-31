import { ComponentFixture } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>;
  let appComponentInstance: AppComponent;

  beforeEach(() => {
    cy.mount(AppComponent, {
      imports: [RouterTestingModule, SharedModule],
      declarations: [AppComponent],
    }).then((component) => {
      fixture = component.fixture;
      appComponentInstance = fixture.componentInstance;
    });
  });

  it("should create the app", () => {
    expect(appComponentInstance).to.exist;
  });

  it(`should have as title 'groupHQ-UI'`, () => {
    expect(appComponentInstance.title).to.equal("groupHQ-UI");
  });

  it("should render title", () => {
    cy.get("[data-cy='site-title-compact']").should("contain", "GroupHQ Demo");
  });
});
