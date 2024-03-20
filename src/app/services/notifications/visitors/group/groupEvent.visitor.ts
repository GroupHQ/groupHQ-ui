import { EventVisitor } from "../eventVisitor";
import { PublicEventModel } from "../../../../model/events/publicEvent.model";
import { Injectable } from "@angular/core";
import { GroupUpdatedHandler } from "../../eventhandlers/groupEventHandlers/groupUpdated.handler";
import { JoinGroupHandler } from "../../eventhandlers/groupEventHandlers/joinGroup.handler";
import { LeaveGroupHandler } from "../../eventhandlers/groupEventHandlers/leaveGroup.handler";
import { EventTypeEnum } from "../../../../model/enums/eventType.enum";
import { PrivateEventModel } from "../../../../model/events/privateEvent.model";

@Injectable({
  providedIn: "root",
})
export class GroupEventVisitor implements EventVisitor {
  constructor(
    private readonly groupUpdatedHandler: GroupUpdatedHandler,
    private readonly joinGroupHandler: JoinGroupHandler,
    private readonly leaveGroupHandler: LeaveGroupHandler,
  ) {}

  visitPrivateEvent(event: PrivateEventModel): void {
    console.debug("PrivateGroupVisitor visited", event);

    switch (event.eventType) {
      case EventTypeEnum.GROUP_UPDATED:
        this.groupUpdatedHandler.handlePrivateEvent(event);
        break;
      case EventTypeEnum.MEMBER_JOINED:
        this.joinGroupHandler.handlePrivateEvent(event);
        break;
      case EventTypeEnum.MEMBER_LEFT:
        this.leaveGroupHandler.handlePrivateEvent(event);
        break;
      default:
        console.warn("Unsupported event type for private group visitor", event);
        break;
    }
  }

  visitPublicEvent(event: PublicEventModel): void {
    console.debug("PublicGroupVisitor visited", event);

    switch (event.eventType) {
      case EventTypeEnum.GROUP_CREATED:
      case EventTypeEnum.GROUP_UPDATED:
        this.groupUpdatedHandler.handlePublicEvent(event);
        break;
      case EventTypeEnum.MEMBER_JOINED:
        this.joinGroupHandler.handlePublicEvent(event);
        break;
      case EventTypeEnum.MEMBER_LEFT:
        this.leaveGroupHandler.handlePublicEvent(event);
        break;
      default:
        console.warn("Unsupported event type for public group visitor", event);
        break;
    }
  }
}
