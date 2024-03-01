import { Injectable } from "@angular/core";
import { PrivateEventModel } from "../../model/privateEvent.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { EventStatusEnum } from "../../model/enums/eventStatus.enum";
import { MemberModel } from "../../model/member.model";
import { UserService } from "./user.service";
import { PublicEventModel } from "../../model/publicEvent.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RsocketPublicUpdateStreamService } from "../network/rsocket/streams/rsocketPublicUpdateStream.service";
import { RsocketPrivateUpdateStreamService } from "../network/rsocket/streams/rsocketPrivateUpdateStream.service";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor(
    private readonly _snackbar: MatSnackBar,
    private readonly rsocketPublicUpdateStreamService: RsocketPublicUpdateStreamService,
    private readonly rsocketPrivateUpdateStreamService: RsocketPrivateUpdateStreamService,
    private readonly userService: UserService,
  ) {
    this.monitorPrivateUpdatesStream();
    this.monitorPublicUpdatesStream();
  }

  private monitorPrivateUpdatesStream() {
    this.rsocketPrivateUpdateStreamService.isPrivateUpdatesStreamReady$.subscribe(
      (status) => {
        if (status) {
          this.subscribeToPrivateUpdatesStream();
        }
      },
    );
  }

  private subscribeToPrivateUpdatesStream() {
    this.rsocketPrivateUpdateStreamService.privateUpdatesStream$.subscribe({
      next: (privateEvent) => {
        console.debug("Received private event: ", privateEvent);
        const message = this.privateEventMessage(privateEvent);

        if (message) {
          this.showMessage(message);
        }
      },
      error: (error) => {
        console.error("Error receiving private event: ", error);
      },
      complete: () => {},
    });
  }

  private monitorPublicUpdatesStream() {
    this.rsocketPublicUpdateStreamService.isPublicUpdatesStreamReady$.subscribe(
      (status) => {
        if (status) {
          this.subscribeToPublicUpdatesStream();
        }
      },
    );
  }

  private subscribeToPublicUpdatesStream() {
    this.rsocketPublicUpdateStreamService.publicUpdatesStream$.subscribe({
      next: (publicEvent) => {
        console.debug("Received public event: ", publicEvent);
        const message = this.publicEventMessage(publicEvent);

        if (message) {
          this.showMessage(message);
        }
      },
      error: (error) => {
        console.error("Error receiving public event: ", error);
      },
      complete: () => {},
    });
  }

  private privateEventMessage(
    privateEvent: PrivateEventModel,
  ): string | undefined {
    switch (privateEvent.eventType) {
      case EventTypeEnum.MEMBER_JOINED:
        if (privateEvent.eventStatus === EventStatusEnum.SUCCESSFUL) {
          this.userService.currentGroupId = privateEvent.aggregateId;

          const member = this.parseIfJson(
            privateEvent.eventData,
          ) as MemberModel;

          this.userService.currentMemberId = member.id;
          return "Successfully joined group";
        } else {
          return "There was a problem trying to join the group";
        }
      case EventTypeEnum.MEMBER_LEFT:
        if (privateEvent.eventStatus === EventStatusEnum.SUCCESSFUL) {
          this.userService.currentGroupId = null;
          this.userService.currentMemberId = null;
          return "Successfully left group";
        } else {
          return "There was a problem trying to leave the group";
        }
    }

    return;
  }

  private publicEventMessage(
    publicEvent: PublicEventModel,
  ): string | undefined {
    if (
      publicEvent.eventStatus !== EventStatusEnum.SUCCESSFUL ||
      publicEvent.aggregateId !== this.userService.currentGroupId
    ) {
      return;
    }

    switch (publicEvent.eventType) {
      case EventTypeEnum.GROUP_DISBANDED:
        this.userService.currentGroupId = null;
        return "Group has been disbanded";
      case EventTypeEnum.MEMBER_JOINED:
      case EventTypeEnum.MEMBER_LEFT:
        if (publicEvent.aggregateId === this.userService.currentGroupId) {
          const member = this.parseIfJson(publicEvent.eventData) as MemberModel;

          return (
            member.username +
            (publicEvent.eventType === EventTypeEnum.MEMBER_JOINED
              ? " joined the group"
              : " left the group")
          );
        }
    }

    return;
  }

  private showMessage(message: string) {
    console.debug("Sending message: ", message);
    this._snackbar.open(message, "Dismiss", {
      verticalPosition: "top",
      duration: 5000,
    });
  }

  private parseIfJson<T>(maybeJson: string | T): T {
    if (typeof maybeJson === "string") {
      try {
        maybeJson = JSON.parse(maybeJson) as T;
      } catch (error) {
        console.error(
          `Error parsing event data to object for ${maybeJson}`,
          error,
        );
        throw new Error("Invalid JSON string");
      }
    }

    return maybeJson as T;
  }
}
