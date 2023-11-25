import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LoadingComponent } from "./loading.component";
import { trigger } from "@angular/animations";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonModule } from "@angular/material/button";

@Component({
  template: `<app-loading
    [itemName]="itemName"
    [nextRetry]="nextRetry"
    [minimumLoadingTimeSeconds]="minimumLoadingTimeSeconds"
    [retryFunction]="retryFunction"
    [loading]="loading"
  ></app-loading>`,
})
class TestHostComponent {
  itemName: string | null = null;
  nextRetry: number | null = null;
  minimumLoadingTimeSeconds = 1;
  retryFunction: (() => void) | null = null;
  loading = true;
}

describe("LoadingComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatProgressBarModule, MatButtonModule],
      declarations: [LoadingComponent, TestHostComponent],
    })
      .overrideComponent(LoadingComponent, {
        set: {
          animations: [trigger("loadingAnimation", [])],
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

  it("shows the loading component", () => {
    expect(page.isLoadingComponentVisible).toBeTrue();
  });

  describe("loading state", () => {
    beforeEach(() => {
      testHost.loading = true;
      fixture.detectChanges();
    });

    it("should show the loading text when nextRetry is null", () => {
      testHost.nextRetry = null;
      fixture.detectChanges();
      expect(page.isLoadingTextVisible).toBeTrue();
    });

    it("should show the progress bar when nextRetry is null", () => {
      testHost.nextRetry = null;
      fixture.detectChanges();
      expect(page.isLoadingProgressBarVisible).toBeTrue();
    });

    describe("retrying state", () => {
      it("should not show the retrying state when nextRetry is null", () => {
        testHost.nextRetry = null;
        fixture.detectChanges();
        expect(page.isLoadingRetryingTextVisible).toBeFalse();
      });

      it("should show the retrying state when nextRetry is not null", () => {
        testHost.nextRetry = 1000;
        fixture.detectChanges();
        expect(
          page.isLoadingRetryingFailureTextVisible ||
            page.isLoadingRetryingTextVisible,
        ).toBeTrue();
      });

      it("should only show the retrying state with the next retry time when nextRetry is greater than 0", () => {
        testHost.nextRetry = 1000;
        fixture.detectChanges();
        expect(
          page.isLoadingRetryingFailureTextVisible ||
            !page.isLoadingRetryingTextVisible,
        ).toBeTrue();
      });

      it("should only show the retrying now state when nextRetry is less than or equal to 0", () => {
        testHost.nextRetry = 0;
        fixture.detectChanges();
        expect(
          !page.isLoadingRetryingFailureTextVisible ||
            page.isLoadingRetryingTextVisible,
        ).toBeTrue();
      });

      it("should show the progress bar in a retry state only when nextRetry is less than or equal to 0", () => {
        testHost.nextRetry = 1000;
        fixture.detectChanges();
        expect(page.isLoadingProgressBarVisible).toBeFalse();

        testHost.nextRetry = 0;
        fixture.detectChanges();
        expect(page.isLoadingProgressBarVisible).toBeTrue();
      });

      describe("retry button", () => {
        it("should not show the retry button when nextRetry is null", () => {
          testHost.nextRetry = null;
          fixture.detectChanges();
          expect(page.isLoadingRetryButtonVisible).toBeFalse();
        });

        it("should not show the retry button when retryFunction is null", () => {
          testHost.retryFunction = null;
          fixture.detectChanges();
          expect(page.isLoadingRetryButtonVisible).toBeFalse();
        });

        it("should not show the retry button when nextRetry is not null and retryFunction is null", () => {
          testHost.nextRetry = 1000;
          fixture.detectChanges();
          expect(page.isLoadingRetryButtonVisible).toBeFalse();
        });

        it("should show the retry button when nextRetry and retryFunction are both not null", () => {
          testHost.nextRetry = 1000;
          testHost.retryFunction = () => {};
          fixture.detectChanges();
          expect(page.isLoadingRetryButtonVisible).toBeTrue();
        });

        it("should not show the retry button when nextRetry is less than or equal to 0", () => {
          testHost.retryFunction = () => {};

          testHost.nextRetry = 0;
          fixture.detectChanges();
          expect(page.isLoadingRetryButtonVisible).toBeFalse();

          testHost.nextRetry = -1;
          fixture.detectChanges();
          expect(page.isLoadingRetryButtonVisible).toBeFalse();
        });
      });
    });
  });

  describe("try again state", () => {
    beforeEach(() => {
      testHost.loading = false;
      fixture.detectChanges();
    });

    it("should not show the loading state when loading is false", () => {
      expect(page.isLoadingTextVisible).toBeFalse();
    });

    it("should not show the retrying state when loading is false", () => {
      expect(page.isLoadingRetryingFailureTextVisible).toBeFalse();
    });

    it("should not show the progress bar when loading is false", () => {
      expect(page.isLoadingProgressBarVisible).toBeFalse();
    });

    it("should show the failure text when loading is false", () => {
      expect(page.isLoadingFailureTextVisible).toBeTrue();
    });

    it("should not show the retry button when loading is false and retryFunction is null", () => {
      testHost.retryFunction = null;
      fixture.detectChanges();
      expect(page.isLoadingRetryButtonVisible).toBeFalse();
    });

    it("should show the retry button when loading is false and retryFunction is not null", () => {
      testHost.retryFunction = () => {};
      fixture.detectChanges();
      expect(page.isLoadingRetryButtonVisible).toBeTrue();
    });

    it("should call the retry function when the retry button is clicked", () => {
      testHost.retryFunction = jasmine.createSpy("retryFunction");
      fixture.detectChanges();
      page.clickRetryButton();
      expect(testHost.retryFunction).toHaveBeenCalled();
    });
  });
});

class Page {
  private readonly _testHostComponent: HTMLElement;

  constructor(private fixture: ComponentFixture<TestHostComponent>) {
    this._testHostComponent = fixture.nativeElement;
  }

  get isLoadingComponentVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__component']",
    );
    return element !== null;
  }

  get isLoadingTextVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__text']",
    );
    return element !== null;
  }

  get isLoadingRetryingFailureTextVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__retrying-failure-text']",
    );
    return element !== null;
  }

  get isLoadingRetryingTextVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__retrying-text']",
    );
    return element !== null;
  }

  get isLoadingProgressBarVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__progress-bar']",
    );
    return element !== null;
  }

  get isLoadingFailureTextVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__failure-text']",
    );
    return element !== null;
  }

  get isLoadingRetryButtonVisible(): boolean {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__retry-button']",
    );
    return element !== null;
  }

  clickRetryButton(): void {
    const element = this._testHostComponent.querySelector<HTMLElement>(
      "[data-test='loading__retry-button']",
    );
    if (element === null) {
      throw new Error("Retry button not found");
    }

    element.click();
    this.fixture.detectChanges();
  }
}
