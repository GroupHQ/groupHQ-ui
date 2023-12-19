import { Component, OnDestroy, OnInit } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { filter, Subject, takeUntil } from "rxjs";
import { ExtensionAnimation } from "./nav.animations";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { AppMediaBreakpointDirective } from "../directives/attr.breakpoint";
import { MatButtonModule } from "@angular/material/button";
import { NgClass } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
  selector: "app-nav",
  templateUrl: "nav.component.html",
  styleUrl: "nav.component.scss",
  animations: [ExtensionAnimation],
  standalone: true,
  imports: [
    MatToolbarModule,
    NgClass,
    RouterLink,
    MatButtonModule,
    AppMediaBreakpointDirective,
    MatIconModule,
    MatListModule,
  ],
})
export class NavComponent implements OnInit, OnDestroy {
  public page: string | undefined = "GROUPS";
  public navType = "web";
  public showMenu = false;

  select(page?: string) {
    this.page = page;
  }

  private readonly screenTypesMap: Map<string, string> = new Map([
    [Breakpoints.Web, "web"],
    [Breakpoints.Tablet, "tablet | handset"],
    [Breakpoints.Handset, "tablet | handset"],
  ]);

  private readonly destroyBreakpoints = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly breakpoints$: BreakpointObserver,
  ) {
    Array.from(this.screenTypesMap.keys()).forEach((screenType) => {
      breakpoints$
        .observe(screenType)
        .pipe(takeUntil(this.destroyBreakpoints))
        .subscribe((result) => {
          if (result.matches) {
            this.updateNav(screenType);
          }
        });
    });
  }

  // set the page state based on the current route
  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let active = this.activatedRoute;

        while (active.firstChild) {
          active = active.firstChild;
        }

        const currentRoute = active.snapshot.url[0]?.path;

        switch (currentRoute) {
          case undefined:
            this.select("GROUPS");
            break;
          case "about":
            this.select("ABOUT");
            break;
          case "sources":
            this.select("SOURCES");
            break;
          default:
            this.select(undefined);
            break;
        }
      });
  }

  getPageToLowercase() {
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
    this.destroyBreakpoints.next();
    this.destroyBreakpoints.complete();
  }
}
