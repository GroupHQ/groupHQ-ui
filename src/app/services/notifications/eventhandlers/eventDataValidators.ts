import { EventDataModel } from "../../../model/events/eventDataModel";
import { MemberModel } from "../../../model/member.model";
import { ErrorDataModel } from "../../../model/errorData.model";
import { GroupModel } from "../../../model/group.model";

export function isEventDataGroupModel(
  eventData: EventDataModel,
): eventData is GroupModel {
  return (
    eventData !== null &&
    typeof eventData === "object" &&
    "id" in eventData &&
    typeof eventData.id === "number" &&
    "title" in eventData &&
    typeof eventData.title === "string" &&
    "description" in eventData &&
    typeof eventData.description === "string" &&
    "maxGroupSize" in eventData &&
    typeof eventData.maxGroupSize === "number" &&
    "createdDate" in eventData &&
    typeof eventData.createdDate === "string" &&
    "lastModifiedDate" in eventData &&
    typeof eventData.lastModifiedDate === "string" &&
    "createdBy" in eventData &&
    typeof eventData.createdBy === "string" &&
    "lastModifiedBy" in eventData &&
    typeof eventData.lastModifiedBy === "string" &&
    "version" in eventData &&
    typeof eventData.version === "number" &&
    "status" in eventData &&
    typeof eventData.status === "string" &&
    "members" in eventData &&
    Array.isArray(eventData.members) &&
    eventData.members.every((member) => isEventDataMemberModel(member))
  );
}

export function isEventDataMemberModel(
  eventData: EventDataModel,
): eventData is MemberModel {
  return (
    eventData !== null &&
    typeof eventData === "object" &&
    "id" in eventData &&
    typeof eventData.id === "number" &&
    "username" in eventData &&
    typeof eventData.username === "string" &&
    "groupId" in eventData &&
    typeof eventData.groupId === "number" &&
    "memberStatus" in eventData &&
    typeof eventData.memberStatus === "string" &&
    "joinedDate" in eventData &&
    typeof eventData.joinedDate === "string" &&
    "exitedDate" in eventData &&
    (typeof eventData.exitedDate === "string" || eventData.exitedDate === null)
  );
}

export function isEventDataErrorModel(
  eventData: EventDataModel,
): eventData is ErrorDataModel {
  return (
    eventData !== null &&
    typeof eventData === "object" &&
    "error" in eventData &&
    typeof eventData.error !== "object"
  );
}
