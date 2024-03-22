import { EventHandler } from "../eventHandler";
import { GroupUpdatedHandler } from "./groupUpdated.handler";
import { TestBed } from "@angular/core/testing";
import { PrivateEventModel } from "../../../model/events/privateEvent.model";
import { UserService } from "../../user/user.service";
import { NotificationService } from "../../notifications/notification.service";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";
import { GroupStatusEnum } from "../../../model/enums/groupStatus.enum";
import { GroupModel } from "../../../model/group.model";
import { PublicEventModel } from "../../../model/events/publicEvent.model";

describe("GroupUpdatedHandler", () => {
  let groupUpdatedHandler: EventHandler;
  let userService: UserService;
  let notificationService: NotificationService;

  let privateEvent: PrivateEventModel;
  let publicEvent: PublicEventModel;
  let eventData: GroupModel;

  beforeEach(() => {
    eventData = new GroupModel(
      1,
      "title",
      "description",
      5,
      Date.now().toString(),
      Date.now().toString(),
      "owner",
      "owner",
      1,
      GroupStatusEnum.DISBANDED,
      [],
    );

    privateEvent = {} as PrivateEventModel;

    publicEvent = {} as PublicEventModel;

    TestBed.configureTestingModule({
      providers: [GroupUpdatedHandler],
    });

    groupUpdatedHandler = TestBed.inject(GroupUpdatedHandler);
    userService = TestBed.inject(UserService);
    notificationService = TestBed.inject(NotificationService);
    spyOn(notificationService, "showMessage");
  });

  describe("handlePrivateEvent", () => {
    it("should throw an error since private group update events are currently unsupported", () => {
      expect(() =>
        groupUpdatedHandler.handlePrivateEvent(privateEvent),
      ).toThrowError("Unsupported private group update event");
    });
  });

  describe("handlePublicEvent", () => {
    describe("unsuccessful event", () => {
      beforeEach(() => {
        publicEvent.eventStatus = EventStatusEnum.FAILED;
      });

      it("should not take any action if the event is unsuccessful", () => {
        groupUpdatedHandler.handlePublicEvent(publicEvent);
        expect(notificationService.showMessage).not.toHaveBeenCalled();
      });
    });

    describe("successful event", () => {
      beforeEach(() => {
        publicEvent.eventStatus = EventStatusEnum.SUCCESSFUL;
      });

      describe("user in updated group", () => {
        beforeEach(() => {
          userService.setUserInGroup(1, 1);
          publicEvent.aggregateId = 1;
        });

        it("should set the user's currentGroupId and currentMemberId to null if their group is disbanded", () => {
          const disbandedStatuses = [
            GroupStatusEnum.BANNED,
            GroupStatusEnum.AUTO_DISBANDED,
            GroupStatusEnum.DISBANDED,
          ];

          for (const status of disbandedStatuses) {
            eventData.status = status;
            publicEvent.eventData = eventData;
            groupUpdatedHandler.handlePublicEvent(publicEvent);
            expect(userService.currentGroupId).toBeNull();
            expect(userService.currentMemberId).toBeNull();
          }
        });

        describe("notifications", () => {
          it("should display a notification if the user's group has been banned", () => {
            eventData.status = GroupStatusEnum.BANNED;
            publicEvent.eventData = eventData;
            groupUpdatedHandler.handlePublicEvent(publicEvent);
            expect(notificationService.showMessage).toHaveBeenCalledWith(
              "Your group has been banned",
            );
          });

          it("should display a notification if the user's group has expired and has been disbanded", () => {
            eventData.status = GroupStatusEnum.AUTO_DISBANDED;
            publicEvent.eventData = eventData;
            groupUpdatedHandler.handlePublicEvent(publicEvent);
            expect(notificationService.showMessage).toHaveBeenCalledWith(
              "Your group has expired and has been disbanded",
            );
          });

          it("should display a notification if the user's group has been disbanded by the owner", () => {
            eventData.status = GroupStatusEnum.DISBANDED;
            publicEvent.eventData = eventData;
            groupUpdatedHandler.handlePublicEvent(publicEvent);
            expect(notificationService.showMessage).toHaveBeenCalledWith(
              "Your group has been disbanded by the owner",
            );
          });
        });
      });

      describe("user not in updated group", () => {
        beforeEach(() => {
          userService.setUserInGroup(2, 1);
          publicEvent.aggregateId = 1;
        });

        it("should not set the user's currentGroupId and currentMemberId to null if the group has been disbanded", () => {
          publicEvent.eventData = {
            ...eventData,
            status: GroupStatusEnum.DISBANDED,
          };
          groupUpdatedHandler.handlePublicEvent(publicEvent);
          expect(userService.currentGroupId).toBe(2);
          expect(userService.currentMemberId).toBe(1);
        });
      });
    });

    describe("invalid event data", () => {
      it("should not take any action and throw an error if the if the event data is invalid", () => {
        userService.setUserInGroup(1, 1);

        publicEvent.eventStatus = EventStatusEnum.SUCCESSFUL;

        publicEvent.eventData = {};

        expect(() =>
          groupUpdatedHandler.handlePublicEvent(publicEvent),
        ).toThrowError();

        expect(userService.currentGroupId).toBe(1);
        expect(userService.currentMemberId).toBe(1);
        expect(notificationService.showMessage).not.toHaveBeenCalled();
      });
    });
  });
});
