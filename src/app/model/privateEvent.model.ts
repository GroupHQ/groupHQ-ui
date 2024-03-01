import { PublicEventModel } from "./publicEvent.model";
import { AggregateTypeEnum } from "./enums/aggregateType.enum";
import { EventTypeEnum } from "./enums/eventType.enum";
import { EventStatusEnum } from "./enums/eventStatus.enum";
import { EventDataModel } from "./eventDataModel";

export class PrivateEventModel extends PublicEventModel {
  constructor(
    public eventId: string,
    public override aggregateId: number,
    public websocketId: string,
    public override aggregateType: AggregateTypeEnum,
    public override eventType: EventTypeEnum,
    public override eventData: string | EventDataModel,
    public override eventStatus: EventStatusEnum,
    public override createdDate: string,
  ) {
    super(
      aggregateId,
      aggregateType,
      eventType,
      eventData,
      eventStatus,
      createdDate,
    );
  }
}
