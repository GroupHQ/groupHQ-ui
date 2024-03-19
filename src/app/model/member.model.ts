import { MemberStatusEnum } from "./enums/memberStatus.enum";
import { EventDataModel } from "./events/eventDataModel";

export class MemberModel implements EventDataModel {
  constructor(
    public id: number,
    public username: string,
    public groupId: number,
    public memberStatus: MemberStatusEnum,
    public joinedDate: string,
    public exitedDate: string | null,
  ) {}
}
