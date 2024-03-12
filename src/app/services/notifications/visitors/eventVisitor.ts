import { PublicEventModel } from "../../../model/publicEvent.model";
import { PrivateEventModel } from "../../../model/privateEvent.model";

export interface EventVisitor {
  visitPrivateEvent(event: PrivateEventModel): void;
  visitPublicEvent(event: PublicEventModel): void;
}
