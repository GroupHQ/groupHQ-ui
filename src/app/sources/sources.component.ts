import { Component, HostBinding } from "@angular/core";
import { AppMediaBreakpointDirective } from "../shared/directives/attr.breakpoint";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-sources",
  templateUrl: "sources.component.html",
  styleUrl: "sources.component.scss",
  standalone: true,
  imports: [AppMediaBreakpointDirective, MatIcon],
})
export class SourcesComponent {
  @HostBinding("class") classes = "component-container";
}
