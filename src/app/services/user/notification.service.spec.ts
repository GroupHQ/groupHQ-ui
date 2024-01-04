import { NotificationService } from "./notification.service";
import { TestBed } from "@angular/core/testing";
import { RsocketPublicUpdateStreamService } from "../network/rsocket/streams/rsocketPublicUpdateStream.service";
import { RsocketPrivateUpdateStreamService } from "../network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "./user.service";
import { cold, getTestScheduler } from "jasmine-marbles";
import { PrivateEventModel } from "../../model/privateEvent.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { EventStatusEnum } from "../../model/enums/eventStatus.enum";
import { MemberModel } from "../../model/member.model";
import { ConfigService } from "../../config/config.service";
import { RETRY_FOREVER } from "../../app-tokens";
import { RetryForeverConstantService } from "../retry/retryForeverConstant.service";
import { PublicEventModel } from "../../model/publicEvent.model";

describe("NotificationService", () => {
  let service: NotificationService;
  let rsocketPublicUpdateStreamService: RsocketPublicUpdateStreamService;
  let rsocketPrivateUpdateStreamService: RsocketPrivateUpdateStreamService;
  let snackBar: MatSnackBar;
  let userService: Partial<UserService>;

  beforeEach(() => {
    userService = {
      currentGroupId: null,
      currentMemberId: null,
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: UserService, useValue: userService },
        { provide: ConfigService, useValue: {} },
        { provide: RETRY_FOREVER, useValue: RetryForeverConstantService },
      ],
    });

    rsocketPrivateUpdateStreamService = TestBed.inject(
      RsocketPrivateUpdateStreamService,
    );
    rsocketPublicUpdateStreamService = TestBed.inject(
      RsocketPublicUpdateStreamService,
    );

    spyOnProperty(
      rsocketPrivateUpdateStreamService,
      "isPrivateUpdatesStreamReady$",
    ).and.returnValue(cold("a", { a: true }));
    spyOnProperty(
      rsocketPublicUpdateStreamService,
      "isPublicUpdatesStreamReady$",
    ).and.returnValue(cold("a", { a: true }));

    snackBar = TestBed.inject(MatSnackBar);
    spyOn(snackBar, "open");
    service = TestBed.inject(NotificationService);
  });

  it("should create the notification service", () => {
    expect(service).toBeTruthy();
  });

  describe("private notifications", () => {
    describe("group notifications", () => {
      describe("joining a group", () => {
        it("should show a notification when the user is added to a group", () => {
          const member: Partial<MemberModel> = {
            id: 2,
          };
          const privateEvent: Partial<PrivateEventModel> = {
            eventType: EventTypeEnum.MEMBER_JOINED,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
            eventData: JSON.stringify(member),
          };

          spyOnProperty(
            rsocketPrivateUpdateStreamService,
            "privateUpdatesStream$",
          ).and.returnValue(cold("a", { a: privateEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).toHaveBeenCalledOnceWith(
            "Successfully joined group",
            jasmine.anything(),
            jasmine.anything(),
          );
          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(2);
        });

        it("should show an error notification when the user fails to be added to a group", () => {
          const privateEvent: Partial<PrivateEventModel> = {
            eventType: EventTypeEnum.MEMBER_JOINED,
            eventStatus: EventStatusEnum.FAILED,
            aggregateId: 1,
          };

          spyOnProperty(
            rsocketPrivateUpdateStreamService,
            "privateUpdatesStream$",
          ).and.returnValue(cold("a", { a: privateEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).toHaveBeenCalledOnceWith(
            "There was a problem trying to join the group",
            jasmine.anything(),
            jasmine.anything(),
          );
          expect(userService.currentGroupId).toBe(null);
          expect(userService.currentMemberId).toBe(null);
        });
      });

      describe("leaving a group", () => {
        it("should show a notification when the user is removed from a group", () => {
          const privateEvent: Partial<PrivateEventModel> = {
            eventType: EventTypeEnum.MEMBER_LEFT,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
          };

          spyOnProperty(
            rsocketPrivateUpdateStreamService,
            "privateUpdatesStream$",
          ).and.returnValue(cold("a", { a: privateEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).toHaveBeenCalledOnceWith(
            "Successfully left group",
            jasmine.anything(),
            jasmine.anything(),
          );
          expect(userService.currentGroupId).toBe(null);
          expect(userService.currentMemberId).toBe(null);
        });

        describe("error notification", () => {
          const triggerLeaveGroupFailure = () => {
            const privateEvent: Partial<PrivateEventModel> = {
              eventType: EventTypeEnum.MEMBER_LEFT,
              eventStatus: EventStatusEnum.FAILED,
              aggregateId: 1,
            };

            spyOnProperty(
              rsocketPrivateUpdateStreamService,
              "privateUpdatesStream$",
            ).and.returnValue(cold("a", { a: privateEvent }));

            getTestScheduler().flush();
          };

          it("should show an error notification when the user fails to be removed from a group", () => {
            triggerLeaveGroupFailure();

            expect(snackBar.open).toHaveBeenCalledOnceWith(
              "There was a problem trying to leave the group",
              jasmine.anything(),
              jasmine.anything(),
            );
            expect(userService.currentGroupId).toBe(null);
            expect(userService.currentMemberId).toBe(null);
          });

          it("should not reset a member's group and member id when failing to be removed from a group", () => {
            userService.currentGroupId = 1;
            userService.currentMemberId = 2;

            triggerLeaveGroupFailure();

            expect(snackBar.open).toHaveBeenCalledOnceWith(
              "There was a problem trying to leave the group",
              jasmine.anything(),
              jasmine.anything(),
            );
            expect(userService.currentGroupId).toBe(1);
            expect(userService.currentMemberId).toBe(2);
          });
        });
      });
    });
  });

  describe("public notifications", () => {
    describe("group notifications", () => {
      describe("disbanding a group", () => {
        it("should show a notification when the group a user is a part of disbands", () => {
          userService.currentGroupId = 1;

          const publicEvent: Partial<PublicEventModel> = {
            eventType: EventTypeEnum.GROUP_DISBANDED,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
          };

          spyOnProperty(
            rsocketPublicUpdateStreamService,
            "publicUpdatesStream$",
          ).and.returnValue(cold("a", { a: publicEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).toHaveBeenCalledOnceWith(
            "Group has been disbanded",
            jasmine.anything(),
            jasmine.anything(),
          );

          expect(userService.currentGroupId as number | null).toBe(null);
        });
        it("should not show a notification for a group disbandment for groups the user is not a part of", () => {
          userService.currentGroupId = 2;

          const publicEvent: Partial<PublicEventModel> = {
            eventType: EventTypeEnum.GROUP_DISBANDED,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
          };

          spyOnProperty(
            rsocketPublicUpdateStreamService,
            "publicUpdatesStream$",
          ).and.returnValue(cold("a", { a: publicEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).not.toHaveBeenCalled();
          expect(userService.currentGroupId).toBe(2);
        });
      });

      describe("joining a group", () => {
        it("should show a notification when a user is added to a group", () => {
          userService.currentGroupId = 1;
          const member: Partial<MemberModel> = {
            id: 2,
            username: "Captain Qwark",
          };

          const publicEvent: Partial<PublicEventModel> = {
            eventType: EventTypeEnum.MEMBER_JOINED,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
            eventData: JSON.stringify(member),
          };

          spyOnProperty(
            rsocketPublicUpdateStreamService,
            "publicUpdatesStream$",
          ).and.returnValue(cold("a", { a: publicEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).toHaveBeenCalledOnceWith(
            `${member.username} joined the group`,
            jasmine.anything(),
            jasmine.anything(),
          );
        });

        it("should not show a notification for a member joining a group the user is not a part of", () => {
          userService.currentGroupId = 2;
          const member: Partial<MemberModel> = {
            id: 2,
            username: "Captain Qwark",
          };

          const publicEvent: Partial<PublicEventModel> = {
            eventType: EventTypeEnum.MEMBER_JOINED,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
            eventData: JSON.stringify(member),
          };

          spyOnProperty(
            rsocketPublicUpdateStreamService,
            "publicUpdatesStream$",
          ).and.returnValue(cold("a", { a: publicEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).not.toHaveBeenCalled();
        });
      });

      describe("leaving a group", () => {
        it("should show a notification when a user is removed from a group", () => {
          userService.currentGroupId = 1;
          const member: Partial<MemberModel> = {
            id: 2,
            username: "Captain Qwark",
          };

          const publicEvent: Partial<PublicEventModel> = {
            eventType: EventTypeEnum.MEMBER_LEFT,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
            eventData: JSON.stringify(member),
          };

          spyOnProperty(
            rsocketPublicUpdateStreamService,
            "publicUpdatesStream$",
          ).and.returnValue(cold("a", { a: publicEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).toHaveBeenCalledOnceWith(
            `${member.username} left the group`,
            jasmine.anything(),
            jasmine.anything(),
          );
        });

        it("should not show a notification for a member leaving a group the user is not a part of", () => {
          userService.currentGroupId = 2;
          const member: Partial<MemberModel> = {
            id: 2,
            username: "Captain Qwark",
          };

          const publicEvent: Partial<PublicEventModel> = {
            eventType: EventTypeEnum.MEMBER_LEFT,
            eventStatus: EventStatusEnum.SUCCESSFUL,
            aggregateId: 1,
            eventData: JSON.stringify(member),
          };

          spyOnProperty(
            rsocketPublicUpdateStreamService,
            "publicUpdatesStream$",
          ).and.returnValue(cold("a", { a: publicEvent }));

          getTestScheduler().flush();

          expect(snackBar.open).not.toHaveBeenCalled();
        });
      });
    });
  });
});
