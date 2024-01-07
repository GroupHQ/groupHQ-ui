import { Injectable } from "@angular/core";
import { RsocketService } from "../rsocket.service";
import { RsocketMetadataService } from "../rsocketMetadata.service";
import { GroupJoinRequestEvent } from "../../../../model/requestevent/GroupJoinRequestEvent";
import { v4 as uuidv4 } from "uuid";
import { GroupLeaveRequestEvent } from "../../../../model/requestevent/GroupLeaveRequestEvent";
import { Buffer } from "buffer";
import { MemberModel } from "../../../../model/member.model";
import { Payload } from "rsocket-core";

@Injectable({
  providedIn: "root",
})
export class RsocketRequestsService {
  constructor(
    private readonly rsocketService: RsocketService,
    private readonly rsocketMetadataService: RsocketMetadataService,
  ) {}

  public currentMemberForUser(
    callback: (member: MemberModel) => void,
    username: string,
    password = "empty",
  ) {
    this.throwIfRsocketIsNotReady();

    const MEMBER_REQUEST_ROUTE = "groups.user.member";
    const metadata = this.rsocketMetadataService.authMetadataWithRoute(
      MEMBER_REQUEST_ROUTE,
      username,
      password,
    );

    this.rsocketService.rsocketConnection!.requestResponse(
      {
        data: null,
        metadata,
      },
      {
        onError(error: Error) {
          console.error("Error sending member request", error);
        },
        onNext: (payload: Payload) => {
          const member = this.convertPayloadToMember(payload.data);
          console.log("Current member is", member);
          member && callback(member);
        },
        onExtension() {},
        onComplete() {
          console.log("Member request completed");
        },
      },
    );
  }

  public sendJoinRequest(
    memberName: string,
    groupId: number,
    username: string,
    password = "empty",
  ): undefined {
    this.throwIfRsocketIsNotReady();

    const JOIN_GROUP_ROUTE = "groups.join";
    const metadata = this.rsocketMetadataService.authMetadataWithRoute(
      JOIN_GROUP_ROUTE,
      username,
      password,
    );
    const groupJoinRequest = new GroupJoinRequestEvent(
      uuidv4(),
      groupId,
      username,
      new Date().toISOString(),
      memberName,
    );

    this.rsocketService.rsocketConnection!.fireAndForget(
      {
        data: Buffer.from(JSON.stringify(groupJoinRequest)),
        metadata,
      },
      {
        onError(error: Error) {
          console.error("Error sending join request", error);
        },
        onComplete() {
          console.log("Join request sent");
        },
      },
    );
  }

  public sendLeaveRequest(
    groupId: number,
    memberId: number,
    username: string,
    password = "empty",
  ): undefined {
    this.throwIfRsocketIsNotReady();

    const LEAVE_GROUP_ROUTE = "groups.leave";
    const metadata = this.rsocketMetadataService.authMetadataWithRoute(
      LEAVE_GROUP_ROUTE,
      username,
      password,
    );
    const groupLeaveRequest = new GroupLeaveRequestEvent(
      uuidv4(),
      groupId,
      username,
      new Date().toISOString(),
      memberId,
    );

    this.rsocketService.rsocketConnection!.fireAndForget(
      {
        data: Buffer.from(JSON.stringify(groupLeaveRequest)),
        metadata,
      },
      {
        onError(error: Error) {
          console.error("Error sending leave request", error);
        },
        onComplete() {
          console.log("Leave request sent");
        },
      },
    );
  }

  private throwIfRsocketIsNotReady() {
    if (!this.rsocketService.isConnectionReady) {
      throw new Error("RSocket is not initialized");
    }
  }

  private convertPayloadToMember(
    data: Buffer | null | undefined,
  ): MemberModel | null {
    if (!data) {
      return null;
    }

    return JSON.parse(data.toString()) as MemberModel;
  }
}