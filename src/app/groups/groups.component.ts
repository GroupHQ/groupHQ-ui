import { Component, HostBinding } from "@angular/core";

@Component({
  selector: "app-groups",
  templateUrl: "groups.component.html",
  styleUrls: ["groups.component.scss"],
})
export class GroupsComponent {
  @HostBinding("class") classes = "component-container";
}
