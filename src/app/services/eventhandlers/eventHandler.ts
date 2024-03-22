import { PublicEventModel } from "../../model/events/publicEvent.model";
import { PrivateEventModel } from "../../model/events/privateEvent.model";

export interface EventHandler {
  handlePublicEvent(event: PublicEventModel): void;
  handlePrivateEvent(event: PrivateEventModel): void;
}
