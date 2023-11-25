export class PublicEventModel {
  constructor(
    public aggregateId: number,
    public aggregateType: string,
    public eventType: string,
    public eventData: string,
    public eventStatus: string,
    public createdDate: string,
  ) {}
}
