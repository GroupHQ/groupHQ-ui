/**
 * A member's current status in a group.
 */
export enum MemberStatusEnum {
  /**
   * Member is currently part of its referenced group.
   */
  ACTIVE = "ACTIVE",

  /**
   * Member was part of its referenced group but has since left.
   */
  LEFT = "LEFT",

  /**
   * Member was part of its referenced group but has since left
   * due to the group being disbanded somehow.
   */
  AUTO_LEFT = "AUTO_LEFT",

  /**
   * Member was part of its referenced group but has since been kicked.
   */
  KICKED = "KICKED",

  /**
   * Member was part of its referenced group but has since been banned.
   */
  BANNED = "BANNED",
}
