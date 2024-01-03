export abstract class RequestEvent {
  protected constructor(
    public readonly eventId: string,
    public readonly aggregateId: number,
    public readonly websocketId: string,
    public readonly createdDate: string,
  ) {}
}
