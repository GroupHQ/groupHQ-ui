export class GroupModel {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public currentGroupSize: number,
    public maxGroupSize: number,
    public lastActive: string,
    public createdDate: string,
    public lastModifiedDate: string,
    public createdBy: string,
    public lastModifiedBy: string,
    public version: number,
    public status: string,
  ) {}
}
