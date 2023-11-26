import { Component, HostBinding } from "@angular/core";
import { AppMediaBreakpointDirective } from "../shared/directives/attr.breakpoint";

@Component({
  selector: "app-about",
  templateUrl: "about.component.html",
  styleUrl: "about.component.scss",
  standalone: true,
  imports: [AppMediaBreakpointDirective],
})
export class AboutComponent {
  @HostBinding("class") classes = "component-container";
}
