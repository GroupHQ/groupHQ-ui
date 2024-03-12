import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { RouterTestingModule } from "@angular/router/testing";
import { NavComponent } from "./shared/nav/nav.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { NotificationService } from "./services/notifications/notification.service";

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>;
  let appComponentInstance: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NavComponent,
        FooterComponent,
        AppComponent,
      ],
      providers: [{ provide: NotificationService, useValue: {} }],
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
