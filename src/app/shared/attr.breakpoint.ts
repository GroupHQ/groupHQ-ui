import { Attribute, Directive, ElementRef, OnDestroy } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Subject, takeUntil } from "rxjs";

@Directive({
  selector: "[appMedia]",
})
export class GhqMediaBreakpointDirective implements OnDestroy {
  private readonly screenTypesMap: Map<string, string> = new Map([
    [Breakpoints.Web, "web"],
    [Breakpoints.Tablet, "tablet"],
    [Breakpoints.Handset, "handset"],
  ]);

  private currentDeviceClass: string | undefined;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly element: ElementRef,
    @Attribute("app-media-base-class") private baseClass: string,
    private readonly breakpoints$: BreakpointObserver,
  ) {
    element.nativeElement.classList.add(baseClass);

    Array.from(this.screenTypesMap.keys()).forEach((screenType) => {
      breakpoints$
        .observe(screenType)
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result.matches) {
            const deviceClass: string =
              baseClass + "-" + this.screenTypesMap.get(screenType) ?? "web";
            if (this.currentDeviceClass)
              element.nativeElement.classList.remove(this.currentDeviceClass);
            element.nativeElement.classList.add(deviceClass);
            this.currentDeviceClass = deviceClass;
          }
        });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
