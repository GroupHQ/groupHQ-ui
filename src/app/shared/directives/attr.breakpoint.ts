import { Attribute, Directive, ElementRef, OnDestroy } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Subject, takeUntil } from "rxjs";

@Directive({
  selector: "[appMedia]",
  standalone: true,
})
export class AppMediaBreakpointDirective implements OnDestroy {
  private readonly screenTypesMap: Map<string, string> = new Map([
    [Breakpoints.Web, "web"],
    [Breakpoints.Tablet, "tablet"],
    [Breakpoints.Handset, "handset"],
  ]);

  private currentDeviceClass: string | undefined;

  private readonly destroy$ = new Subject<void>();

  private readonly element: ElementRef;
  private readonly baseClass: string;
  private readonly breakpoints$: BreakpointObserver;

  constructor(
    element: ElementRef,
    @Attribute("app-media-base-class") baseClass: string,
    breakpoints$: BreakpointObserver,
  ) {
    this.element = element;
    this.baseClass = baseClass;
    this.breakpoints$ = breakpoints$;
    this.setupBreakpointSubscription();
  }

  setupBreakpointSubscription() {
    this.element.nativeElement.classList.add(this.baseClass);

    Array.from(this.screenTypesMap.keys()).forEach((screenType) => {
      this.breakpoints$
        .observe(screenType)
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result.matches) {
            this.updateElementClassList(screenType);
          }
        });
    });
  }

  updateElementClassList(screenType: string) {
    const deviceClass: string =
      this.baseClass + "-" + (this.screenTypesMap.get(screenType) ?? "web");
    if (this.currentDeviceClass)
      this.element.nativeElement.classList.remove(this.currentDeviceClass);
    this.element.nativeElement.classList.add(deviceClass);
    this.currentDeviceClass = deviceClass;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
