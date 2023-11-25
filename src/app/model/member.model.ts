export class MemberModel {
  constructor(
    public id: number,
    public username: string,
    public memberStatus: string,
    public joinedDate: string,
    public exitedDate?: string,
  ) {}
}
