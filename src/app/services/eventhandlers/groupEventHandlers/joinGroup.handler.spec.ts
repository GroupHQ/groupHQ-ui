import { JoinGroupHandler } from "./joinGroup.handler";
import { UserService } from "../../user/user.service";
import { NotificationService } from "../../notifications/notification.service";
import { PublicEventModel } from "../../../model/events/publicEvent.model";
import { PrivateEventModel } from "../../../model/events/privateEvent.model";
import { TestBed } from "@angular/core/testing";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";
import { MemberModel } from "../../../model/member.model";
import { MemberStatusEnum } from "../../../model/enums/memberStatus.enum";
import { ErrorDataModel } from "../../../model/errorData.model";

describe("JoinGroupHandler", () => {
  let joinGroupHandler: JoinGroupHandler;
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
      providers: [JoinGroupHandler],
    });

    joinGroupHandler = TestBed.inject(JoinGroupHandler);
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

      describe("user joining group", () => {
        it("should set the current group and member id and show a message", () => {
          privateEvent.eventData = memberModel;

          joinGroupHandler.handlePrivateEvent(privateEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).toHaveBeenCalledWith(
            `Successfully joined group as ${memberModel.username}!`,
          );
        });

        it("should not take any action if the user is already in the group", () => {
          userService.setUserInGroup(1, 1);

          privateEvent.eventData = memberModel;

          joinGroupHandler.handlePrivateEvent(privateEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        });
      });
    });

    describe("unsuccessful event", () => {
      beforeEach(() => {
        privateEvent.eventStatus = EventStatusEnum.FAILED;
      });

      it("should not change the user's group and member id", () => {
        const errorDataModel = new ErrorDataModel("Group is full");
        privateEvent.eventData = errorDataModel;

        joinGroupHandler.handlePrivateEvent(privateEvent);

        expect(userService.currentGroupId).toBe(null);
        expect(userService.currentMemberId).toBe(null);
        expect(notificationService.showMessage).toHaveBeenCalledWith(
          `Error joining group: ${errorDataModel.error}`,
        );
      });
    });

    describe("invalid event data", () => {
      it("should not take any action and throw an error if the event data is invalid", () => {
        const eventStatuses = [
          EventStatusEnum.SUCCESSFUL,
          EventStatusEnum.FAILED,
        ];

        for (const eventStatus of eventStatuses) {
          privateEvent.eventStatus = eventStatus;
          privateEvent.eventData = {};

          expect(() =>
            joinGroupHandler.handlePrivateEvent(privateEvent),
          ).toThrowError();

          expect(userService.currentGroupId).toBe(null);
          expect(userService.currentMemberId).toBe(null);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("handlePublicEvent", () => {
    beforeEach(() => {
      userService.setUserInGroup(1, 1);
    });

    describe("successful event", () => {
      beforeEach(() => {
        publicEvent.eventStatus = EventStatusEnum.SUCCESSFUL;
        publicEvent.aggregateId = 1;
      });

      describe("user joining group", () => {
        it("should show a message that a user has joined the group if the current user is part of the group and is not the one who joined", () => {
          memberModel.id = 2;
          publicEvent.eventData = memberModel;

          joinGroupHandler.handlePublicEvent(publicEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).toHaveBeenCalledWith(
            `${memberModel.username} joined the group!`,
          );
        });

        it("should not show a message if the same user joined the group", () => {
          publicEvent.aggregateId = 1;
          publicEvent.eventData = memberModel;

          joinGroupHandler.handlePublicEvent(publicEvent);

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).not.toHaveBeenCalled();
        });
      });
    });

    describe("unsuccessful event", () => {
      beforeEach(() => {
        publicEvent.eventStatus = EventStatusEnum.FAILED;
      });

      it("should not take any action if event is unsuccessful", () => {
        joinGroupHandler.handlePublicEvent(publicEvent);

        expect(userService.currentGroupId).toBe(1);
        expect(userService.currentMemberId).toBe(1);
        expect(notificationService.showMessage).not.toHaveBeenCalled();
      });
    });

    describe("invalid event data", () => {
      it("should not take any action and throw an error if the event data is invalid", () => {
        publicEvent.eventStatus = EventStatusEnum.SUCCESSFUL;
        publicEvent.eventData = {};

        expect(() =>
          joinGroupHandler.handlePublicEvent(publicEvent),
        ).toThrowError();

        expect(userService.currentGroupId).toBe(1);
        expect(userService.currentMemberId).toBe(1);
        expect(notificationService.showMessage).not.toHaveBeenCalled();
      });
    });
  });
});
