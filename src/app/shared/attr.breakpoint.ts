import {Attribute, Directive, ElementRef} from "@angular/core";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Subject, takeUntil} from "rxjs";

@Directive({
    selector: "[ghq-media]"
})
export class GhqMediaBreakpointDirective {

    private readonly screenTypesMap : Map<string, string> = new Map([
        [Breakpoints.Web, "web"],
        [Breakpoints.Tablet, "tablet"],
        [Breakpoints.Handset, "handset"]
    ]);

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly element: ElementRef,
                @Attribute("ghq-media-base-class") private baseClass: string,
                private readonly breakpoints$ : BreakpointObserver
    ) {
        element.nativeElement.classList.add(baseClass);

        Array.from(this.screenTypesMap.keys()).forEach(screenType => {
            breakpoints$.observe(screenType)
                .pipe(takeUntil(this.destroy$))
                .subscribe(result => {
                    if (result.matches) {
                        element.nativeElement.className = '';
                        const deviceClass : string = baseClass + '-' + this.screenTypesMap.get(screenType) ?? "web";
                        element.nativeElement.classList.add(baseClass, deviceClass);
                    }
                });
        }, (error : any) => {
            console.error('Error observing breakpoints:', error);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}