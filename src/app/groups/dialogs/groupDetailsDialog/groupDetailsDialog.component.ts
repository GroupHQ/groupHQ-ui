import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { GroupInputNameDialogComponent } from "../groupInputNameDialog/groupInputNameDialog.component";
import { GroupModel } from "../../../model/group.model";
import { Subscription } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { AppMediaBreakpointDirective } from "../../../shared/directives/attr.breakpoint";
import { GroupManagerService } from "../../services/groupManager.service";
import { UserService } from "../../../services/user/user.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { GroupLeaveRequestEvent } from "../../../model/requestevent/GroupLeaveRequestEvent";
import { v4 as uuidv4 } from "uuid";
import { AsynchronousRequestMediator } from "../../../services/notifications/asynchronousRequest.mediator";
import { DateAgoPipe } from "./date-ago.pipe";

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
    DateAgoPipe,
  ],
})
export class GroupDetailsDialogComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public inputNameDialogRef: MatDialogRef<GroupInputNameDialogComponent> | null =
    null;
  public loading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public group: GroupModel,
    public dialog: MatDialog,
    private readonly groupManagerService: GroupManagerService,
    public readonly userService: UserService,
    private readonly asyncRequestMediator: AsynchronousRequestMediator,
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.groupManagerService.groups$.subscribe((groups) => {
        const updatedGroup = groups.find((g) => g.id === this.group.id);
        if (updatedGroup) {
          this.group = updatedGroup;
        }
      }),
    );

    // Closes dialog to join group when a user is assigned to a group
    this.subscriptions.add(
      this.userService.currentGroupId$.subscribe((groupId) => {
        if (groupId) {
          this.inputNameDialogRef?.close();
        }
      }),
    );
  }

  openInputNameDialog(): void {
    this.inputNameDialogRef = this.dialog.open(GroupInputNameDialogComponent, {
      data: this.group,
    });
  }

  leaveGroup(): void {
    if (!this.userService.currentMemberId) {
      throw new Error("User is not a member of any group");
    }

    const leaveRequest: GroupLeaveRequestEvent = new GroupLeaveRequestEvent(
      uuidv4(),
      this.group.id,
      this.userService.uuid,
      new Date().toISOString(),
      this.userService.currentMemberId,
    );

    this.loading = true;

    console.debug("Leaving group: ", leaveRequest);
    this.asyncRequestMediator
      .submitRequestEvent(leaveRequest, "groups.leave", "groups.updates.user")
      .subscribe({
        complete: () => (this.loading = false),
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
