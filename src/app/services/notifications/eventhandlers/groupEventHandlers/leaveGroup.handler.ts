import { Injectable } from "@angular/core";
import { EventHandler } from "../eventHandler";
import { UserService } from "../../../user/user.service";
import { NotificationService } from "../../notification.service";
import { PrivateEventModel } from "../../../../model/privateEvent.model";
import { PublicEventModel } from "../../../../model/publicEvent.model";
import { MemberModel } from "../../../../model/member.model";
import { ErrorDataModel } from "../../../../model/errorData.model";
import { EventStatusEnum } from "../../../../model/enums/eventStatus.enum";
import {
  isEventDataErrorModel,
  isEventDataMemberModel,
} from "../eventDataValidators";

@Injectable({
  providedIn: "root",
})
export class LeaveGroupHandler implements EventHandler {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  handlePrivateEvent(event: PrivateEventModel): void {
    switch (event.eventStatus) {
      case EventStatusEnum.SUCCESSFUL:
        this.visitPrivateEventSuccess(event);
        break;
      case EventStatusEnum.FAILED:
        this.visitPrivateEventFailure(event);
        break;
      default:
        console.warn(
          "Invalid event status for private leave group event: ",
          event,
        );
        break;
    }
  }

  visitPrivateEventSuccess(event: PrivateEventModel): void {
    if (!isEventDataMemberModel(event.eventData)) {
      console.warn(
        "Invalid event data for private leave group successful event: ",
        event,
      );
      return;
    }

    const exitedMember: MemberModel = event.eventData as MemberModel;

    if (this.userService.currentGroupId !== event.aggregateId) return;

    this.userService.removeUserFromGroup();
    this.notificationService.showMessage(
      `Successfully left group as ${exitedMember.username}!`,
    );
  }

  visitPrivateEventFailure(event: PrivateEventModel): void {
    if (!isEventDataErrorModel(event.eventData)) {
      console.warn(
        "Invalid event data for private leave group failure event: ",
        event,
      );
      return;
    }

    const errorData: ErrorDataModel = event.eventData as ErrorDataModel;
    this.notificationService.showMessage(
      `Error leaving group: ${errorData.error}`,
    );
  }

  handlePublicEvent(event: PublicEventModel): void {
    switch (event.eventStatus) {
      case EventStatusEnum.SUCCESSFUL:
        this.visitPublicEventSuccess(event);
        break;
      case EventStatusEnum.FAILED:
        console.debug(
          "Public leave group failed event received. No action taken.",
        );
        break;
      default:
        console.warn(
          "Invalid event status for public leave group event: ",
          event,
        );
        break;
    }
  }

  visitPublicEventSuccess(event: PublicEventModel): void {
    if (!isEventDataMemberModel(event.eventData)) {
      console.warn(
        "Invalid event data for public leave group successful event: ",
        event,
      );
      return;
    }

    const exitedMember: MemberModel = event.eventData as MemberModel;
    const groupId: number = event.aggregateId;

    if (
      this.userService.currentGroupId === groupId &&
      this.userService.currentMemberId !== exitedMember.id
    ) {
      this.notificationService.showMessage(
        `${exitedMember.username} left the group`,
      );
    }
  }
}
