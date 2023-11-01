import { ComponentFixture } from "@angular/core/testing";
import { AboutComponent } from "./about.component";

describe("AboutComponent", () => {
  let fixture: ComponentFixture<AboutComponent>;
  let aboutComponent: AboutComponent;

  beforeEach(() => {
    cy.mount(AboutComponent, {
      declarations: [AboutComponent],
    }).then((component) => {
      fixture = component.fixture;
      aboutComponent = fixture.componentInstance;
    });
  });

  it("adds the component-container class to the component's root tag", () => {
    expect(aboutComponent).to.exist;
    expect(aboutComponent.classes).to.equal("component-container");
  });
});
