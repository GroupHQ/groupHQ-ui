import { Component, HostBinding } from "@angular/core";
import { GroupBoardComponent } from "../groupBoard/groupBoard.component";
import { GroupUtilityBarComponent } from "../groupUtilityBar/groupUtilityBar.component";

@Component({
  selector: "app-groups",
  templateUrl: "groups.component.html",
  styleUrls: ["groups.component.scss"],
  standalone: true,
  imports: [GroupUtilityBarComponent, GroupBoardComponent],
})
export class GroupsComponent {
  @HostBinding("class") classes = "component-container";
}
