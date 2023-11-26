import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { GroupBoardAnimation } from "./groupCards.animation";
import { GroupModel } from "../../model/group.model";
import { GroupCardComponent } from "../groupCard/groupCard.component";
import { AppMediaBreakpointDirective } from "../../shared/directives/attr.breakpoint";

@Component({
  selector: "app-group-cards",
  templateUrl: "./groupCards.component.html",
  styleUrl: "groupCards.component.scss",
  animations: [GroupBoardAnimation],
  standalone: true,
  imports: [AppMediaBreakpointDirective, GroupCardComponent],
})
export class GroupCardsComponent implements AfterViewInit {
  @ViewChildren(GroupCardComponent)
  itemElements!: QueryList<GroupCardComponent>;

  @Output()
  public groupCards = new EventEmitter<QueryList<GroupCardComponent>>();

  @Input()
  groups: GroupModel[] = [];

  @Input()
  isGroupsSynced = false;

  ngAfterViewInit() {
    console.log("Emitting group cards");
    this.groupCards.emit(this.itemElements);
  }

  trackByItems(index: number, item: GroupModel): number {
    return item.id;
  }
}
