import { PublicEventModel } from "../../../model/publicEvent.model";
import { PrivateEventModel } from "../../../model/privateEvent.model";

export interface EventHandler {
  handlePublicEvent(event: PublicEventModel): void;
  handlePrivateEvent(event: PrivateEventModel): void;
}
