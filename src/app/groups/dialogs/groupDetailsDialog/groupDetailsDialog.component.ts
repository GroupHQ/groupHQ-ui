import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
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
    MatDialogClose,
  ],
})
export class GroupDetailsDialogComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  constructor(
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GroupDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: GroupModel,
    public dialog: MatDialog,
    private groupManagerService: GroupManagerService,
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
  }

  openInputNameDialog(): void {
    const dialogRef = this.dialog.open(GroupInputNameDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
