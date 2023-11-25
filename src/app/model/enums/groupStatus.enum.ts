/**
 * A group's current status.
 */
export enum GroupStatusEnum {
  /**
   * Group is visible to users and is accepting members.
   */
  ACTIVE = "ACTIVE",

  /**
   * Group disbanded by Group Owner.
   * Group is not visible to users, is not accepting members, and has no active members.
   */
  DISBANDED = "DISBANDED",

  /**
   * Group auto-disbanded by System.
   * Group is not visible to users, is not accepting members, and has no active members.
   */
  AUTO_DISBANDED = "AUTO_DISBANDED",

  /**
   * Group banned by System or privileged user.
   * Group is not visible to users, is not accepting members, and has no active members.
   */
  BANNED = "BANNED",
}
