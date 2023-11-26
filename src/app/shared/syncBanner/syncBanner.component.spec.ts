import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SyncBannerComponent } from "./syncBanner.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { trigger } from "@angular/animations";

@Component({
  template: ` <app-sync-banner
    [syncedTextState]="toggleSyncedTextState"
  ></app-sync-banner>`,
  standalone: true,
  imports: [SyncBannerComponent],
})
class TestHostComponent {
  toggleSyncedTextState = false;
}

describe("SyncBannerComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, SyncBannerComponent, TestHostComponent],
    })
      .overrideComponent(SyncBannerComponent, {
        set: {
          animations: [trigger("syncBanner", [])],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    page = new Page(fixture);
  });

  it("creates the component", () => {
    expect(testHost).toBeTruthy();
  });

  describe("synced text state", () => {
    it("shows the sync error text when syncedTextState is false", () => {
      testHost.toggleSyncedTextState = false;
      fixture.detectChanges();
      expect(page.isSyncBannerErrorMessageVisible).toBeTrue();
    });

    it("shows the synced text when syncedTextState is true", () => {
      testHost.toggleSyncedTextState = true;
      fixture.detectChanges();
      expect(page.isSyncBannerSyncedMessageVisible).toBeTrue();
    });

    it("shows the synced text when syncedTextState is true right before setting isSynced to true", () => {
      testHost.toggleSyncedTextState = true;
      fixture.detectChanges();
      expect(page.isSyncBannerSyncedMessageVisible).toBeTrue();
    });
  });
});

class Page {
  private readonly _testHostComponent: HTMLElement;

  constructor(fixture: ComponentFixture<TestHostComponent>) {
    this._testHostComponent = fixture.nativeElement;
  }

  get isSyncBannerVisible(): boolean {
    const element: HTMLElement | null = this._testHostComponent.querySelector(
      "[data-test='sync-banner']",
    );
    return element !== null;
  }

  get isSyncBannerErrorMessageVisible(): boolean {
    const element = this._testHostComponent.querySelector(
      "[data-test='sync-banner__error-message']",
    );
    return element !== null;
  }

  get isSyncBannerSyncedMessageVisible(): boolean {
    const element = this._testHostComponent.querySelector(
      "[data-test='sync-banner__synced-message']",
    );
    return element !== null;
  }
}
