import { RouterTestingModule } from "@angular/router/testing";
import { FooterComponent } from "./footer.component";

describe("FooterComponent", () => {
  it("should create the footer component", () => {
    cy.mount(FooterComponent, {
      imports: [RouterTestingModule],
      declarations: [FooterComponent],
    }).then((component) => {
      expect(component.fixture.componentInstance).to.exist;
    });
  });
});
