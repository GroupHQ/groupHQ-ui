import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
import { RouterTestingModule } from "@angular/router/testing";

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>;
  let appComponentInstance: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    appComponentInstance = fixture.componentInstance;
  });

  it("should create the app", () => {
    expect(appComponentInstance).toBeTruthy();
  });

  it(`should have as title 'groupHQ-UI'`, () => {
    expect(appComponentInstance.title).toEqual("groupHQ-UI");
  });

  // it("should render title", () => {
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement;
  //   expect(
  //     compiled.querySelector('[data-test="site-title-default"]').textContent,
  //   ).toContain("GroupHQ Demo");
  // });
});
