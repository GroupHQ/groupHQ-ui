import { Component, HostBinding } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppMediaBreakpointDirective } from "../shared/directives/attr.breakpoint";

@Component({
  selector: "app-page-not-found",
  standalone: true,
  imports: [CommonModule, AppMediaBreakpointDirective],
  templateUrl: "./page-not-found.component.html",
  styleUrl: "./page-not-found.component.scss",
})
export class PageNotFoundComponent {
  @HostBinding("class") classes = "component-container";
}
