import { MemberModel } from "./member.model";
import { GroupStatusEnum } from "./enums/groupStatus.enum";

export class GroupModel {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public maxGroupSize: number,
    public createdDate: string,
    public lastModifiedDate: string,
    public createdBy: string,
    public lastModifiedBy: string,
    public version: number,
    public status: GroupStatusEnum,
    public members: MemberModel[],
  ) {}
}
