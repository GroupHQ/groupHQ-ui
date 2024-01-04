import { RequestEvent } from "./RequestEvent";

export class GroupJoinRequestEvent extends RequestEvent {
  constructor(
    public override readonly eventId: string,
    public override readonly aggregateId: number,
    public override readonly websocketId: string,
    public override readonly createdDate: string,
    public readonly username: string,
  ) {
    super(eventId, aggregateId, websocketId, createdDate);
  }
}
