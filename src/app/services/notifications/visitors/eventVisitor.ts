import { PublicEventModel } from "../../../model/events/publicEvent.model";
import { PrivateEventModel } from "../../../model/events/privateEvent.model";

export interface EventVisitor {
  visitPrivateEvent(event: PrivateEventModel): void;
  visitPublicEvent(event: PublicEventModel): void;
}
