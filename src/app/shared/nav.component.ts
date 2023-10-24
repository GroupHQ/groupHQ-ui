import {Component} from "@angular/core";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Subject, takeUntil} from "rxjs";
import {ExtensionAnimation} from "./nav.animations";

@Component({
    selector: "app-nav",
    templateUrl: "nav.component.html",
    styleUrls: ["nav.component.scss"],
    animations: [ExtensionAnimation]
})
export class NavComponent {
    page: string | undefined = "GROUPS";
    navType: string = "web"
    showMenu: boolean = false;

    select(page?: string) {
        this.page = page;
    }

    private readonly screenTypesMap : Map<string, string> = new Map([
        [Breakpoints.Web, "web"],
        [Breakpoints.Tablet, "tablet | handset"],
        [Breakpoints.Handset, "tablet | handset"]
    ]);

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly breakpoints$ : BreakpointObserver) {
        Array.from(this.screenTypesMap.keys()).forEach(screenType => {
            breakpoints$.observe(screenType)
                .pipe(takeUntil(this.destroy$))
                .subscribe(result => {
                    if (result.matches) {
                        this.updateNav(screenType);
                    }
                });
        }, (error : any) => {
            console.error('Error observing breakpoints:', error);
        });
    }

    getPage() {
        return this.page?.toLowerCase() ?? "";
    }

    updateNav(screenType: string) {
        this.navType = this.screenTypesMap.get(screenType) ?? "web";
        if (this.navType == "web") {
            this.showMenu = false;
        }
    }

    toggleMenu() {
        this.showMenu = !this.showMenu;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}