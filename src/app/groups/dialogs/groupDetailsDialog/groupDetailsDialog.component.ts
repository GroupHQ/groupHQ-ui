import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
  MatDialogActions,
} from "@angular/material/dialog";
import { GroupInputNameDialogComponent } from "../groupInputNameDialog/groupInputNameDialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GroupModel } from "../../../model/group.model";
import { Subscription } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { AppMediaBreakpointDirective } from "../../../shared/directives/attr.breakpoint";
import { GroupManagerService } from "../../services/groupManager.service";
import { RsocketRequestsService } from "../../../services/network/rsocket/requests/rsocketRequests.service";
import { UserService } from "../../../services/user/user.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RsocketPrivateUpdateStreamService } from "../../../services/network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { PrivateEventModel } from "../../../model/privateEvent.model";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";
import { EventTypeEnum } from "../../../model/enums/eventType.enum";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: "app-group-details-dialog",
  templateUrl: "groupDetailsDialog.component.html",
  styleUrl: "groupDetailsDialog.component.scss",
  standalone: true,
  imports: [
    AppMediaBreakpointDirective,
    MatDialogTitle,
    MatDialogContent,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogClose,
    MatDialogActions,
    MatProgressBarModule,
  ],
})
export class GroupDetailsDialogComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  public inputNameDialogRef: MatDialogRef<GroupInputNameDialogComponent> | null =
    null;
  public isPrivateUpdateStreamReady: boolean = true;
  public errorLeavingGroup: boolean = false;
  public loading: boolean = false;
  public timeout: number = 5000;
  public timeoutId: any;
  public privateUpdateStreamSubscription: Subscription | null = null;

  constructor(
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GroupDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: GroupModel,
    public dialog: MatDialog,
    private readonly groupManagerService: GroupManagerService,
    public readonly userService: UserService,
    private readonly rsocketRequestsService: RsocketRequestsService,
    private readonly rsocketPrivateUpdateStreamService: RsocketPrivateUpdateStreamService,
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.groupManagerService.groups$.subscribe((groups) => {
        // Update the group data
        const updatedGroup = groups.find((g) => g.id === this.group.id);
        if (updatedGroup) {
          this.group = updatedGroup;
        }
      }),
    );

    this.userService.currentGroupId$.subscribe((groupId) => {
      if (groupId) {
        this.inputNameDialogRef?.close();
      }
    });
  }

  openInputNameDialog(): void {
    this.inputNameDialogRef = this.dialog.open(GroupInputNameDialogComponent, {
      data: this.group,
    });

    this.inputNameDialogRef.afterClosed().subscribe((result) => {
      if (result?.message) {
        this._snackBar.open(result.message, undefined, {
          duration: 4000,
          horizontalPosition: "start",
        });
      }

      console.log("Input modal closed; no message");
    });
  }

  timeSince(date: string) {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );

    if (seconds < 0) return 0;

    let interval: number;

    interval = seconds / 3600;
    if (interval > 1) {
      const floored = Math.floor(interval);
      return floored === 1 ? "1 hour ago" : floored + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      const floored = Math.floor(interval);
      return floored === 1 ? "1 minute ago" : floored + " minutes ago";
    }
    const floored = Math.floor(seconds);
    return floored === 1 ? "1 second ago" : floored + " seconds ago";
  }

  leaveGroup(): void {
    this.isPrivateUpdateStreamReady =
      this.rsocketPrivateUpdateStreamService.isPrivateUpdatesStreamReady;

    if (this.isPrivateUpdateStreamReady) {
      this.loading = true;
      this.privateUpdateStreamSubscription =
        this.rsocketPrivateUpdateStreamService.privateUpdatesStream$.subscribe(
          (privateEvent) => {
            this.handleLeaveGroupResponse(privateEvent);
          },
        );

      this.rsocketRequestsService.sendLeaveRequest(
        this.group.id,
        this.userService.currentMemberId!,
        this.userService.uuid,
      );

      this.timeoutId = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.errorLeavingGroup = true;
          this.privateUpdateStreamSubscription?.unsubscribe();
        }
      }, this.timeout);
    }
  }

  private handleLeaveGroupResponse(privateEvent: PrivateEventModel) {
    if (
      privateEvent.eventType === EventTypeEnum.MEMBER_LEFT &&
      privateEvent.aggregateId === this.group.id
    ) {
      this.loading = false;
      this.privateUpdateStreamSubscription?.unsubscribe();
      clearTimeout(this.timeoutId);

      if (privateEvent.eventStatus !== EventStatusEnum.SUCCESSFUL) {
        this.errorLeavingGroup = true;
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
