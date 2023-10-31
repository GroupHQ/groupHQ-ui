import { ComponentFixture } from "@angular/core/testing";
import { SourcesComponent } from "./sources.component";

describe("SourcesComponent", () => {
  let fixture: ComponentFixture<SourcesComponent>;
  let component: SourcesComponent;

  beforeEach(() => {
    cy.mount(SourcesComponent, {
      declarations: [SourcesComponent],
    }).then((component) => {
      fixture = component.fixture;
    });
  });

  it("adds the component-container class to the component's root tag", () => {
    component = fixture.componentInstance;
    expect(component).to.exist;
    expect(component.classes).to.contain("component-container");
  });
});
