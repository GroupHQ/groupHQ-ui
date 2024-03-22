import { PublicEventModel } from "./publicEvent.model";
import { EventVisitor } from "../../services/eventvisitors/eventVisitor";
import { AggregateTypeEnum } from "../enums/aggregateType.enum";
import { EventTypeEnum } from "../enums/eventType.enum";
import { EventStatusEnum } from "../enums/eventStatus.enum";

describe("PublicEventModel", () => {
  let eventVisitor: jasmine.SpyObj<EventVisitor>;
  let publicEvent: PublicEventModel;

  beforeEach(() => {
    eventVisitor = jasmine.createSpyObj("EventVisitor", ["visitPublicEvent"]);
    publicEvent = new PublicEventModel(
      "eventId",
      1,
      AggregateTypeEnum.GROUP,
      EventTypeEnum.GROUP_CREATED,
      {} as any,
      EventStatusEnum.SUCCESSFUL,
      "createdDate",
    );
  });

  describe("#accept", () => {
    it("should call the visitor's visitPublicEvent method", () => {
      publicEvent.accept(eventVisitor);

      expect(eventVisitor.visitPublicEvent).toHaveBeenCalledWith(publicEvent);
    });
  });
});
