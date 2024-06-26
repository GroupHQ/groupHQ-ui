/**
 * Enumerates the types of events that can be used in an event.
 */
export enum EventTypeEnum {
  GROUP_CREATED = "GROUP_CREATED",
  GROUP_UPDATED = "GROUP_UPDATED",
  GROUP_DISBANDED = "GROUP_DISBANDED", // Currently unused by server
  MEMBER_JOINED = "MEMBER_JOINED",
  MEMBER_LEFT = "MEMBER_LEFT",
  NONE = "NONE",
}
