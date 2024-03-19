import { AggregateTypeEnum } from "../enums/aggregateType.enum";
import { EventTypeEnum } from "../enums/eventType.enum";
import { EventStatusEnum } from "../enums/eventStatus.enum";
import { EventDataModel } from "./eventDataModel";
import { Event } from "./event";
import { EventVisitor } from "../../services/notifications/visitors/eventVisitor";

export class PrivateEventModel implements Event {
  constructor(
    public eventId: string,
    public aggregateId: number,
    public websocketId: string,
    public aggregateType: AggregateTypeEnum,
    public eventType: EventTypeEnum,
    public eventData: EventDataModel,
    public eventStatus: EventStatusEnum,
    public createdDate: string,
  ) {}

  accept(visitor: EventVisitor): void {
    visitor.visitPrivateEvent(this);
  }
}
