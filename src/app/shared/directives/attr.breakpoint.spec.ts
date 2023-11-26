import { Component, DebugElement } from "@angular/core";
import { TestBed, ComponentFixture } from "@angular/core/testing";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
  LayoutModule,
} from "@angular/cdk/layout";
import { By } from "@angular/platform-browser";
import { Subject } from "rxjs";
import { AppMediaBreakpointDirective } from "./attr.breakpoint";

@Component({
  template: `<div appMedia app-media-base-class="test-class"></div>`,
  standalone: true,
  imports: [LayoutModule, AppMediaBreakpointDirective],
})
class TestComponent {}

describe("AppMediaBreakpointDirective", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;

  let webBreakpointSubject: Subject<BreakpointState>;
  let tabletBreakpointSubject: Subject<BreakpointState>;
  let handsetBreakpointSubject: Subject<BreakpointState>;
  let breakpointObserverMock: any;

  beforeEach(() => {
    webBreakpointSubject = new Subject();
    tabletBreakpointSubject = new Subject();
    handsetBreakpointSubject = new Subject();

    breakpointObserverMock = (breakpoint: string) => {
      switch (breakpoint) {
        case Breakpoints.Web:
          return webBreakpointSubject.asObservable();
        case Breakpoints.Tablet:
          return tabletBreakpointSubject.asObservable();
        case Breakpoints.Handset:
          return handsetBreakpointSubject.asObservable();
        default:
          return webBreakpointSubject.asObservable();
      }
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: { observe: breakpointObserverMock },
        },
      ],
      imports: [LayoutModule, TestComponent, AppMediaBreakpointDirective],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement.query(
      By.directive(AppMediaBreakpointDirective),
    );
    fixture.detectChanges();
  });

  it("should create an instance", () => {
    expect(component).toBeTruthy();
  });

  it("should add base class on initialization", () => {
    expect(
      debugElement.nativeElement.classList.contains("test-class"),
    ).toBeTrue();
  });

  it("should update class based on breakpoint", () => {
    handsetBreakpointSubject.next({
      matches: true,
      breakpoints: { [Breakpoints.Handset]: true },
    });
    fixture.detectChanges();
    expect(
      debugElement.nativeElement.classList.contains("test-class-handset"),
    ).toBeTrue();
  });

  it("should update class to tablet when tablet breakpoint is active", () => {
    tabletBreakpointSubject.next({
      matches: true,
      breakpoints: { [Breakpoints.Tablet]: true },
    });
    fixture.detectChanges();
    expect(
      debugElement.nativeElement.classList.contains("test-class-tablet"),
    ).toBeTrue();
  });

  it("should update class to web when web breakpoint is active", () => {
    webBreakpointSubject.next({
      matches: true,
      breakpoints: { [Breakpoints.Web]: true },
    });
    fixture.detectChanges();
    expect(
      debugElement.nativeElement.classList.contains("test-class-web"),
    ).toBeTrue();
  });
});
