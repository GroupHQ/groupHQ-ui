import { PrivateEventModel } from "./privateEvent.model";
import { EventRevivable } from "./event.revivable";
import { PublicEventModel } from "./publicEvent.model";
import { EventVisitor } from "../../services/notifications/visitors/eventVisitor";

describe("EventRevivable", () => {
  let visitorSpy: EventVisitor;

  beforeEach(() => {
    visitorSpy = {
      visitPrivateEvent: jasmine.createSpy("visitPrivateEvent"),
      visitPublicEvent: jasmine.createSpy("visitPublicEvent"),
    };
  });

  describe("private event", () => {
    it("should create an instance of private event objects", () => {
      const privateEvent: Partial<PrivateEventModel> = {
        eventId: "eventId",
        websocketId: "websocketId",
      };
      const result = EventRevivable.createEvent(privateEvent);

      expect(result).toBeInstanceOf(PrivateEventModel);

      result.accept(visitorSpy);

      expect(visitorSpy.visitPrivateEvent).toHaveBeenCalledWith(
        result as PrivateEventModel,
      );
    });
  });

  describe("public event", () => {
    it("should create an instance of public event objects", () => {
      const publicEvent: Partial<PublicEventModel> = {
        eventId: "eventId",
      };
      const result = EventRevivable.createEvent(publicEvent);

      expect(result).toBeInstanceOf(PublicEventModel);

      result.accept(visitorSpy);

      expect(visitorSpy.visitPublicEvent).toHaveBeenCalledWith(
        result as PublicEventModel,
      );
    });
  });
});
