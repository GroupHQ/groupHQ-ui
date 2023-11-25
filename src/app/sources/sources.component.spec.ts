import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SourcesComponent } from "./sources.component";

describe("SourcesComponent", () => {
  let fixture: ComponentFixture<SourcesComponent>;
  let sourcesComponent: SourcesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SourcesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SourcesComponent);
    sourcesComponent = fixture.componentInstance;
  });

  it("adds the component-container class to the component's root tag", () => {
    expect(sourcesComponent).toBeTruthy();
    expect(sourcesComponent.classes).toEqual("component-container");
  });
});
