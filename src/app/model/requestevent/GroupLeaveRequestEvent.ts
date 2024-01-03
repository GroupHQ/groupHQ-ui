import { RequestEvent } from "./RequestEvent";

export class GroupLeaveRequestEvent extends RequestEvent {
  constructor(
    public override readonly eventId: string,
    public override readonly aggregateId: number,
    public override readonly websocketId: string,
    public override readonly createdDate: string,
    public readonly memberId: number,
  ) {
    super(eventId, aggregateId, websocketId, createdDate);
  }
}
