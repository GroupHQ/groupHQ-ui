import { PublicEventModel } from "./publicEvent.model";
import { PrivateEventModel } from "./privateEvent.model";

/**
 * Helper class to transform events deserialized form the backend into an actual
 * class instance. This is necessary for the visitor pattern to work, as the backend
 * does not have the accept method on its events.
 */
export class EventRevivable {
  // TODO: This should be updated to use a discriminant type, but that would require changes to group-sync
  public static createEvent(event: any): PublicEventModel | PrivateEventModel {
    if ("websocketId" in event) {
      return EventRevivable.createPrivateEvent(event);
    } else {
      return EventRevivable.createPublicEvent(event);
    }
  }

  private static createPublicEvent(
    publicEvent: PublicEventModel,
  ): PublicEventModel {
    return new PublicEventModel(
      publicEvent.eventId,
      publicEvent.aggregateId,
      publicEvent.aggregateType,
      publicEvent.eventType,
      publicEvent.eventData,
      publicEvent.eventStatus,
      publicEvent.createdDate,
    );
  }

  private static createPrivateEvent(
    privateEvent: PrivateEventModel,
  ): PrivateEventModel {
    return new PrivateEventModel(
      privateEvent.eventId,
      privateEvent.aggregateId,
      privateEvent.websocketId,
      privateEvent.aggregateType,
      privateEvent.eventType,
      privateEvent.eventData,
      privateEvent.eventStatus,
      privateEvent.createdDate,
    );
  }
}
