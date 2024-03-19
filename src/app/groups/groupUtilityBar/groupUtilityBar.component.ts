import { Component } from "@angular/core";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AppMediaBreakpointDirective } from "../../shared/directives/attr.breakpoint";
import { GroupSortingService } from "../services/groupSorting.service";

@Component({
  selector: "app-group-utility-bar",
  templateUrl: "groupUtilityBar.component.html",
  styleUrl: "groupUtilityBar.component.scss",
  standalone: true,
  imports: [
    AppMediaBreakpointDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
})
export class GroupUtilityBarComponent {
  public selected = GroupSortEnum.OLDEST;
  public GroupSortEnum = GroupSortEnum;

  constructor(private groupSortingService: GroupSortingService) {}

  onSortChange() {
    console.debug("Sort changed to: ", this.selected);
    this.groupSortingService.changeSort = this.selected;
  }
}
