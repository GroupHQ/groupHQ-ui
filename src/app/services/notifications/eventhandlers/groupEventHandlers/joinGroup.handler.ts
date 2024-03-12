import { UserService } from "../../../user/user.service";
import { NotificationService } from "../../notification.service";
import { EventHandler } from "../eventHandler";
import { PublicEventModel } from "../../../../model/publicEvent.model";
import { PrivateEventModel } from "../../../../model/privateEvent.model";
import { MemberModel } from "../../../../model/member.model";
import { Injectable } from "@angular/core";
import { EventStatusEnum } from "../../../../model/enums/eventStatus.enum";
import { ErrorDataModel } from "../../../../model/errorData.model";
import {
  isEventDataErrorModel,
  isEventDataMemberModel,
} from "../eventDataValidators";

@Injectable({
  providedIn: "root",
})
export class JoinGroupHandler implements EventHandler {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  handlePrivateEvent(event: PrivateEventModel): void {
    switch (event.eventStatus) {
      case EventStatusEnum.SUCCESSFUL:
        this.privateEventSuccess(event);
        break;
      case EventStatusEnum.FAILED:
        this.privateEventFailure(event);
        break;
      default:
        console.warn(
          "Invalid event status for private join group event: ",
          event,
        );
        break;
    }
  }

  private privateEventSuccess(event: PrivateEventModel): void {
    if (!isEventDataMemberModel(event.eventData)) {
      console.warn(
        "Invalid event data for private join group successful event: ",
        event,
      );
      return;
    }

    const joinedMember: MemberModel = event.eventData as MemberModel;
    const groupId = event.aggregateId;

    if (this.userService.currentGroupId === groupId) return;

    this.userService.setUserInGroup(groupId, joinedMember.id);
    this.notificationService.showMessage(
      `Successfully joined group as ${joinedMember.username}!`,
    );
  }

  private privateEventFailure(event: PrivateEventModel): void {
    if (!isEventDataErrorModel(event.eventData)) {
      console.warn(
        "Invalid event data for private join group successful event: ",
        event,
      );
      return;
    }

    const errorData: ErrorDataModel = event.eventData as ErrorDataModel;
    this.notificationService.showMessage(
      `Error joining group: ${errorData.error}`,
    );
  }

  handlePublicEvent(event: PublicEventModel): void {
    switch (event.eventStatus) {
      case EventStatusEnum.SUCCESSFUL:
        this.publicEventSuccess(event);
        break;
      case EventStatusEnum.FAILED:
        console.debug(
          "Public join group failed event received. No action taken.",
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
    if (!isEventDataMemberModel(event.eventData)) {
      console.warn(
        "Invalid event data for public join group successful event: ",
        event,
      );
      return;
    }

    const joinedMember: MemberModel = event.eventData as MemberModel;
    const groupId: number = event.aggregateId;

    if (
      this.userService.currentGroupId === groupId &&
      this.userService.currentMemberId !== joinedMember.id
    ) {
      this.notificationService.showMessage(
        `${joinedMember.username} joined the group!`,
      );
    }
  }
}
