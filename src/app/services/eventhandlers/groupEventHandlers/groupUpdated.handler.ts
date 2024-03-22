import { Injectable } from "@angular/core";
import { EventHandler } from "../eventHandler";
import { PrivateEventModel } from "../../../model/events/privateEvent.model";
import { PublicEventModel } from "../../../model/events/publicEvent.model";
import { UserService } from "../../user/user.service";
import { NotificationService } from "../../notifications/notification.service";
import { GroupModel } from "../../../model/group.model";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";
import { isEventDataGroupModel } from "../eventDataValidators";
import { GroupStatusEnum } from "../../../model/enums/groupStatus.enum";
import { GroupsService } from "../../../groups/services/groups.service";

@Injectable({
  providedIn: "root",
})
export class GroupUpdatedHandler implements EventHandler {
  constructor(
    private readonly groupService: GroupsService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  handlePrivateEvent(event: PrivateEventModel): void {
    console.warn(
      "Private group update events are currently unsupported",
      event,
    );
    throw new Error("Unsupported private group update event");
  }

  handlePublicEvent(event: PublicEventModel): void {
    switch (event.eventStatus) {
      case EventStatusEnum.SUCCESSFUL:
        this.publicEventSuccess(event);
        break;
      case EventStatusEnum.FAILED:
        console.debug(
          "Public update group failed event received. No action taken.",
        );
        break;
      default:
        console.warn(
          "Invalid event status for public join group event: ",
          event,
        );
        break;
    }
  }

  private publicEventSuccess(event: PublicEventModel): void {
    if (!isEventDataGroupModel(event.eventData)) {
      throw new Error(
        "Invalid event data for public update group successful event",
      );
    }
    const updatedGroup: GroupModel = event.eventData as GroupModel;

    this.groupService.handleGroupUpdate(updatedGroup);

    this.removeMemberIfInDisbandedGroup(updatedGroup);
  }

  private removeMemberIfInDisbandedGroup(updatedGroup: GroupModel): void {
    if (this.userService.currentGroupId !== updatedGroup.id) return;

    if (updatedGroup.status !== GroupStatusEnum.ACTIVE)
      this.userService.removeUserFromGroup();

    switch (updatedGroup.status) {
      case GroupStatusEnum.BANNED:
        this.notificationService.showMessage(`Your group has been banned`);
        break;
      case GroupStatusEnum.AUTO_DISBANDED:
        this.notificationService.showMessage(
          `Your group has expired and has been disbanded`,
        );
        break;
      case GroupStatusEnum.DISBANDED:
        this.notificationService.showMessage(
          `Your group has been disbanded by the owner`,
        );
        break;
    }
  }
}
