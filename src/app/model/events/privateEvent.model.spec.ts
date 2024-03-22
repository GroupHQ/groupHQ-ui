import { EventVisitor } from "../../services/eventvisitors/eventVisitor";
import { AggregateTypeEnum } from "../enums/aggregateType.enum";
import { EventTypeEnum } from "../enums/eventType.enum";
import { EventStatusEnum } from "../enums/eventStatus.enum";
import { PrivateEventModel } from "./privateEvent.model";

describe("PrivateEventModel", () => {
  let eventVisitor: jasmine.SpyObj<EventVisitor>;
  let privateEvent: PrivateEventModel;

  beforeEach(() => {
    eventVisitor = jasmine.createSpyObj("EventVisitor", ["visitPrivateEvent"]);
    privateEvent = new PrivateEventModel(
      "eventId",
      1,
      "websocketId",
      AggregateTypeEnum.GROUP,
      EventTypeEnum.GROUP_CREATED,
      {} as any,
      EventStatusEnum.SUCCESSFUL,
      "createdDate",
    );
  });

  describe("#accept", () => {
    it("should call the visitor's visitPrivateEvent method", () => {
      privateEvent.accept(eventVisitor);

      expect(eventVisitor.visitPrivateEvent).toHaveBeenCalledWith(privateEvent);
    });
  });
});
