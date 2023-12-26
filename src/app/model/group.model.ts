import { MemberModel } from "./member.model";

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
    public status: string,
    public members: MemberModel[],
  ) {}
}
