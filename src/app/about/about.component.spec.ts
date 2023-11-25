import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AboutComponent } from "./about.component";

describe("AboutComponent", () => {
  let fixture: ComponentFixture<AboutComponent>;
  let aboutComponent: AboutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    aboutComponent = fixture.componentInstance;
  });

  it("adds the component-container class to the component's root tag", () => {
    expect(aboutComponent).toBeTruthy();
    expect(aboutComponent.classes).toEqual("component-container");
  });
});
