import { MemberStatusEnum } from "./enums/memberStatus.enum";

export class MemberModel {
  constructor(
    public id: number,
    public username: string,
    public groupId: number,
    public memberStatus: MemberStatusEnum,
    public joinedDate: string,
    public exitedDate: string | null,
  ) {}
}
