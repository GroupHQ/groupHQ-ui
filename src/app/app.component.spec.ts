import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { ConfigService } from "./config/config.service";
import { RouterTestingModule } from "@angular/router/testing";

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>;
  let appComponentInstance: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [{ provide: ConfigService, useValue: {} }],
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
});
