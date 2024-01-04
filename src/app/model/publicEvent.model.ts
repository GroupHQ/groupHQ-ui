import { AggregateTypeEnum } from "./enums/aggregateType.enum";
import { EventTypeEnum } from "./enums/eventType.enum";
import { EventStatusEnum } from "./enums/eventStatus.enum";

export class PublicEventModel {
  constructor(
    public aggregateId: number,
    public aggregateType: AggregateTypeEnum,
    public eventType: EventTypeEnum,
    public eventData: string,
    public eventStatus: EventStatusEnum,
    public createdDate: string,
  ) {}
}
