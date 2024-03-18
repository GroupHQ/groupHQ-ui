import { GroupEventVisitor } from "./groupEvent.visitor";
import { GroupUpdatedHandler } from "../../eventhandlers/groupEventHandlers/groupUpdated.handler";
import { JoinGroupHandler } from "../../eventhandlers/groupEventHandlers/joinGroup.handler";
import { LeaveGroupHandler } from "../../eventhandlers/groupEventHandlers/leaveGroup.handler";
import { TestBed } from "@angular/core/testing";
import { PublicEventModel } from "../../../../model/events/publicEvent.model";
import { PrivateEventModel } from "../../../../model/events/privateEvent.model";
import { EventTypeEnum } from "../../../../model/enums/eventType.enum";

describe("GroupEventVisitor", () => {
  let visitor: GroupEventVisitor;
  let groupUpdatedHandler: GroupUpdatedHandler;
  let joinGroupHandler: JoinGroupHandler;
  let leaveGroupHandler: LeaveGroupHandler;
  let privateEvent: PrivateEventModel;
  let publicEvent: PublicEventModel;

  beforeEach(() => {
    privateEvent = {} as PrivateEventModel;
    publicEvent = {} as PublicEventModel;

    TestBed.configureTestingModule({
      providers: [
        GroupEventVisitor,
        GroupUpdatedHandler,
        JoinGroupHandler,
        LeaveGroupHandler,
      ],
    });

    visitor = TestBed.inject(GroupEventVisitor);
    groupUpdatedHandler = TestBed.inject(GroupUpdatedHandler);
    joinGroupHandler = TestBed.inject(JoinGroupHandler);
    leaveGroupHandler = TestBed.inject(LeaveGroupHandler);
  });

  describe("visitPrivateEvent", () => {
    it("should delegate to GroupUpdatedHandler for GROUP_UPDATED events", () => {
      spyOn(groupUpdatedHandler, "handlePrivateEvent");
      privateEvent.eventType = EventTypeEnum.GROUP_UPDATED;

      visitor.visitPrivateEvent(privateEvent);

      expect(groupUpdatedHandler.handlePrivateEvent).toHaveBeenCalled();
    });

    it("should delegate to JoinGroupHandler for MEMBER_JOINED events", () => {
      spyOn(joinGroupHandler, "handlePrivateEvent");
      privateEvent.eventType = EventTypeEnum.MEMBER_JOINED;

      visitor.visitPrivateEvent(privateEvent);

      expect(joinGroupHandler.handlePrivateEvent).toHaveBeenCalled();
    });

    it("should delegate to LeaveGroupHandler for MEMBER_LEFT events", () => {
      spyOn(leaveGroupHandler, "handlePrivateEvent");
      privateEvent.eventType = EventTypeEnum.MEMBER_LEFT;

      visitor.visitPrivateEvent(privateEvent);

      expect(leaveGroupHandler.handlePrivateEvent).toHaveBeenCalled();
    });
  });

  describe("visitPublicEvent", () => {
    it("should delegate to GroupUpdatedHandler for GROUP_UPDATED events", () => {
      spyOn(groupUpdatedHandler, "handlePublicEvent");
      publicEvent.eventType = EventTypeEnum.GROUP_UPDATED;

      visitor.visitPublicEvent(publicEvent);

      expect(groupUpdatedHandler.handlePublicEvent).toHaveBeenCalled();
    });

    it("should delegate to JoinGroupHandler for MEMBER_JOINED events", () => {
      spyOn(joinGroupHandler, "handlePublicEvent");
      publicEvent.eventType = EventTypeEnum.MEMBER_JOINED;

      visitor.visitPublicEvent(publicEvent);

      expect(joinGroupHandler.handlePublicEvent).toHaveBeenCalled();
    });

    it("should delegate to LeaveGroupHandler for MEMBER_LEFT events", () => {
      spyOn(leaveGroupHandler, "handlePublicEvent");
      publicEvent.eventType = EventTypeEnum.MEMBER_LEFT;

      visitor.visitPublicEvent(publicEvent);

      expect(leaveGroupHandler.handlePublicEvent).toHaveBeenCalled();
    });
  });
});
