import { LeaveGroupHandler } from "./leaveGroup.handler";
import { UserService } from "../../../user/user.service";
import { NotificationService } from "../../notification.service";
import { PrivateEventModel } from "../../../../model/privateEvent.model";
import { PublicEventModel } from "../../../../model/publicEvent.model";
import { TestBed } from "@angular/core/testing";
import { EventStatusEnum } from "../../../../model/enums/eventStatus.enum";
import { MemberModel } from "../../../../model/member.model";
import { MemberStatusEnum } from "../../../../model/enums/memberStatus.enum";
import { ErrorDataModel } from "../../../../model/errorData.model";

describe("LeaveGroupHandler", () => {
  let leaveGroupHandler: LeaveGroupHandler;
  let userService: UserService;
  let notificationService: NotificationService;

  let privateEvent: PrivateEventModel;
  let publicEvent: PublicEventModel;
  let memberModel: MemberModel;

  beforeEach(() => {
    privateEvent = {} as PrivateEventModel;

    publicEvent = {} as PublicEventModel;

    memberModel = new MemberModel(
      1,
      "User",
      1,
      MemberStatusEnum.ACTIVE,
      Date.now().toString(),
      null,
    );

    TestBed.configureTestingModule({
      providers: [LeaveGroupHandler],
    });

    leaveGroupHandler = TestBed.inject(LeaveGroupHandler);
    userService = TestBed.inject(UserService);
    notificationService = TestBed.inject(NotificationService);
    spyOn(notificationService, "showMessage");

    userService.removeUserFromGroup();
  });

  describe("handlePrivateEvent", () => {
    describe("successful event", () => {
      beforeEach(() => {
        privateEvent.eventStatus = EventStatusEnum.SUCCESSFUL;
        privateEvent.aggregateId = 1;
      });

      describe("user leaving group", () => {
        it("should clear the current group and member id if the user is in the group and show a message", () => {
          userService.setUserInGroup(1, 1);
          privateEvent.eventData = memberModel;

          leaveGroupHandler.handlePrivateEvent(privateEvent);

          expect(userService.currentGroupId).toBeNull();
          expect(userService.currentMemberId).toBeNull();
          expect(notificationService.showMessage).toHaveBeenCalledWith(
            `Successfully left group as ${memberModel.username}!`,
          );
        });

        it("should not take any action if the user is not in the group", () => {
          userService.setUserInGroup(2, 2);
          privateEvent.eventData = memberModel;

          leaveGroupHandler.handlePrivateEvent(privateEvent);

          expect(userService.currentGroupId).toBe(2);
          expect(userService.currentMemberId).toBe(2);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        });
      });
    });

    describe("unsuccessful event", () => {
      beforeEach(() => {
        privateEvent.eventStatus = EventStatusEnum.FAILED;
      });

      it("should not change the user's group and member id", () => {
        userService.setUserInGroup(1, 1);
        const errorDataModel = new ErrorDataModel("Group is not active");
        privateEvent.eventData = errorDataModel;

        leaveGroupHandler.handlePrivateEvent(privateEvent);

        expect(userService.currentGroupId).toBe(1);
        expect(userService.currentMemberId).toBe(1);
        expect(notificationService.showMessage).toHaveBeenCalledWith(
          `Error leaving group: ${errorDataModel.error}`,
        );
      });
    });

    describe("invalid event data", () => {
      it("should not take any action if the event data is invalid", () => {
        userService.setUserInGroup(1, 1);

        const eventStatuses = [
          EventStatusEnum.SUCCESSFUL,
          EventStatusEnum.FAILED,
        ];

        for (const eventStatus of eventStatuses) {
          privateEvent.eventStatus = eventStatus;

          privateEvent.eventData = {};

          leaveGroupHandler.handlePrivateEvent(privateEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("handlePublicEvent", () => {
    describe("successful event", () => {
      beforeEach(() => {
        publicEvent.eventStatus = EventStatusEnum.SUCCESSFUL;
        publicEvent.aggregateId = 1;
        userService.setUserInGroup(1, 1);
      });

      describe("user in updated group", () => {
        it("should show a message to the user if someone in their group (excluding themselves) left", () => {
          memberModel.id = 2;
          publicEvent.eventData = memberModel;

          leaveGroupHandler.handlePublicEvent(publicEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).toHaveBeenCalledWith(
            `${memberModel.username} left the group`,
          );
        });

        it("should not take any action if the user left the group", () => {
          publicEvent.eventData = memberModel;

          leaveGroupHandler.handlePublicEvent(publicEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        });

        it("should not take any action if the event data is invalid", () => {
          publicEvent.eventData = {};

          leaveGroupHandler.handlePublicEvent(publicEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        });
      });
    });

    describe("unsuccessful event", () => {
      it("should not take any action if the event is unsuccessful", () => {
        publicEvent.eventStatus = EventStatusEnum.FAILED;
        userService.setUserInGroup(1, 1);

        leaveGroupHandler.handlePublicEvent(publicEvent);

        expect(userService.currentGroupId).toBe(1);
        expect(userService.currentMemberId).toBe(1);
        expect(notificationService.showMessage).not.toHaveBeenCalled();
      });
    });

    describe("invalid event data", () => {
      it("should not take any action if the event data is invalid", () => {
        userService.setUserInGroup(1, 1);

        const eventStatuses = [
          EventStatusEnum.SUCCESSFUL,
          EventStatusEnum.FAILED,
        ];

        for (const eventStatus of eventStatuses) {
          privateEvent.eventStatus = eventStatus;

          privateEvent.eventData = {};

          leaveGroupHandler.handlePublicEvent(privateEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        }
      });
    });
  });
});
