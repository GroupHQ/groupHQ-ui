import { Component, HostBinding } from "@angular/core";

@Component({
  selector: "app-sources",
  templateUrl: "sources.component.html",
  styleUrls: ["sources.component.scss"],
})
export class SourcesComponent {
  @HostBinding("class") classes = "component-container";
}
