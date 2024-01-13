import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingHarness } from "@angular/router/testing";
import { NavComponent } from "./nav.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { provideRouter, Router, RouterLink } from "@angular/router";
import { trigger } from "@angular/animations";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";

describe("NavComponent", () => {
  let navComponentInstance: NavComponent;
  let harness: RouterTestingHarness;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatToolbarModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        RouterLink,
        NavComponent,
      ],
      providers: [provideRouter([{ path: "**", component: NavComponent }])],
    })
      .overrideComponent(NavComponent, {
        set: {
          animations: [trigger("extensionAnimation", [])],
        },
      })
      .compileComponents();

    harness = await RouterTestingHarness.create();
    navComponentInstance = await harness.navigateByUrl("/", NavComponent);
    harness.detectChanges();
  });

  it("should create the nav component", () => {
    expect(navComponentInstance).toBeTruthy();
  });

  describe("#select", () => {
    it("should set the page to the selected page", () => {
      const page = "GROUPS";
      navComponentInstance.select(page);
      expect(navComponentInstance.page).toEqual(page);

      navComponentInstance.select(undefined);
      expect(navComponentInstance.page).toBeUndefined();
    });
  });

  describe("#getPageToLowercase", () => {
    it("should return the page in lowercase", () => {
      navComponentInstance.page = "GROUPS";
      expect(navComponentInstance.getPageToLowercase()).toEqual("groups");
    });
  });

  it("should navigate to the groups page when the title is clicked", async () => {
    navComponentInstance = await harness.navigateByUrl(
      "/test-route",
      NavComponent,
    );

    await harness.fixture.whenStable();
    page = new Page(harness.fixture as ComponentFixture<NavComponent>);
    page.title.click();

    await harness.fixture.whenStable();
    expect(navComponentInstance.page).toEqual("GROUPS");
    expect(TestBed.inject(Router).url)
      .withContext("should navigate to /groups")
      .toEqual("/");
  });

  describe("tabs", () => {
    beforeEach(async () => {
      navComponentInstance = await harness.navigateByUrl(
        "/test-route",
        NavComponent,
      );

      await harness.fixture.whenStable();
      page = new Page(harness.fixture as ComponentFixture<NavComponent>);
      navComponentInstance.showMenu = true;
      harness.detectChanges();
    });

    it("should render the groups tab", () => {
      expect(page.groupsTab).toBeTruthy();
    });

    it("should render the about tab", () => {
      expect(page.aboutTab).toBeTruthy();
    });

    it("should render the sources tab", () => {
      expect(page.sourcesTab).toBeTruthy();
    });

    it("should navigate to the groups page when the groups tab is clicked", async () => {
      page.groupsTab.click();
      await harness.fixture.whenStable();

      expect(navComponentInstance.page).toEqual("GROUPS");
      expect(TestBed.inject(Router).url)
        .withContext("should navigate to /groups")
        .toEqual("/");
    });

    it("should navigate to the about page when the about tab is clicked", async () => {
      page.aboutTab.click();
      await harness.fixture.whenStable();

      expect(navComponentInstance.page).toEqual("ABOUT");
      expect(TestBed.inject(Router).url)
        .withContext("should navigate to /about")
        .toEqual("/about");
    });

    it("should navigate to the sources page when the sources tab is clicked", async () => {
      page.sourcesTab.click();
      await harness.fixture.whenStable();

      expect(navComponentInstance.page).toEqual("SOURCES");
      expect(TestBed.inject(Router).url)
        .withContext("should navigate to /sources")
        .toEqual("/sources");
    });
  });
});

class Page {
  private readonly _navElement: HTMLElement;

  constructor(fixture: ComponentFixture<NavComponent>) {
    this._navElement = fixture.nativeElement;
  }

  get title(): HTMLElement {
    let element;
    element = this._navElement.querySelector<HTMLElement>(
      "[data-test='site-title-default']",
    );

    if (!element) {
      element = this._navElement.querySelector<HTMLElement>(
        "[data-test='site-title-compact']",
      );
    }

    if (!element) {
      throw new Error("No page title element found");
    }
    console.debug("My element is", element);
    return element;
  }

  get groupsTab(): HTMLElement {
    let element;
    element = this._navElement.querySelector<HTMLElement>(
      "[data-test='groups-tab-default']",
    );

    if (!element) {
      element = this._navElement.querySelector<HTMLElement>(
        "[data-test='groups-tab-compact']",
      );
    }

    if (!element) {
      throw new Error("No groups tab element found");
    }

    return element;
  }

  get aboutTab(): HTMLElement {
    let element;
    element = this._navElement.querySelector<HTMLElement>(
      "[data-test='about-tab-default']",
    );

    if (!element) {
      element = this._navElement.querySelector<HTMLElement>(
        "[data-test='about-tab-compact']",
      );
    }

    if (!element) {
      throw new Error("No about tab element found");
    }

    return element;
  }

  get sourcesTab(): HTMLElement {
    let element;
    element = this._navElement.querySelector<HTMLElement>(
      "[data-test='sources-tab-default']",
    );

    if (!element) {
      element = this._navElement.querySelector<HTMLElement>(
        "[data-test='sources-tab-compact']",
      );
    }

    if (!element) {
      throw new Error("No sources tab element found");
    }

    return element;
  }
}
