import { AggregateTypeEnum } from "./enums/aggregateType.enum";
import { EventTypeEnum } from "./enums/eventType.enum";
import { EventDataModel } from "./eventDataModel";
import { EventStatusEnum } from "./enums/eventStatus.enum";
import { EventVisitor } from "../services/notifications/visitors/eventVisitor";

export interface Event {
  eventId: string;
  aggregateId: number;
  aggregateType: AggregateTypeEnum;
  eventType: EventTypeEnum;
  eventData: EventDataModel;
  eventStatus: EventStatusEnum;
  createdDate: string;

  accept(visitor: EventVisitor): void;
}
