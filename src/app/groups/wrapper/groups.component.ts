import { Component, HostBinding } from "@angular/core";
import { GroupBoardComponent } from "../groupBoard/groupBoard.component";
import { GroupUtilityBarComponent } from "../groupUtilityBar/groupUtilityBar.component";
import { EventStreamService } from "../../services/notifications/eventStream.service";
import { PublicEventModel } from "../../model/events/publicEvent.model";
import { GroupEventVisitor } from "../../services/notifications/visitors/group/groupEvent.visitor";
import { map } from "rxjs";

@Component({
  selector: "app-groups",
  templateUrl: "groups.component.html",
  styleUrl: "groups.component.scss",
  standalone: true,
  imports: [GroupUtilityBarComponent, GroupBoardComponent],
})
export class GroupsComponent {
  @HostBinding("class") classes = "component-container";

  constructor(
    private readonly eventStream: EventStreamService,
    private readonly groupEventVisitor: GroupEventVisitor,
  ) {
    this.eventStream
      .stream<PublicEventModel>("groups.updates.all")
      .pipe(map((event) => PublicEventModel.instantiate(event)))
      .subscribe((event) => event.accept(this.groupEventVisitor));
  }
}
