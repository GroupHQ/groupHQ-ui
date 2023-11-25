import { Component } from "@angular/core";
import { GroupsService } from "../services/groups.service";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";

@Component({
  selector: "app-group-utility-bar",
  templateUrl: "groupUtilityBar.component.html",
  styleUrls: ["groupUtilityBar.component.scss"],
})
export class GroupUtilityBarComponent {
  public selected = GroupSortEnum.OLDEST;
  public GroupSortEnum = GroupSortEnum;

  constructor(private groupService: GroupsService) {}

  onSortChange() {
    console.log("Sort changed to: ", this.selected);
    this.groupService.changeSort(this.selected);
  }
}
