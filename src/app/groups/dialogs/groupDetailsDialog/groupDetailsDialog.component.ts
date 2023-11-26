import { Component, Inject, OnDestroy } from "@angular/core";
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
import { HttpService } from "../../../services/network/http.service";
import { MemberModel } from "../../../model/member.model";
import { Subscription } from "rxjs";
import { IdentificationService } from "../../../services/user/identification.service";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { AppMediaBreakpointDirective } from "../../../shared/directives/attr.breakpoint";

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
export class GroupDetailsDialogComponent implements OnDestroy {
  members: MemberModel[] = [];
  subscription: Subscription;

  constructor(
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GroupDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: GroupModel,
    public dialog: MatDialog,
    public httpService: HttpService,
    private idService: IdentificationService,
  ) {
    const username = this.idService.uuid;
    this.subscription = httpService
      .getGroupMembers(username, group.id)
      .subscribe((members) => {
        this.members = members;
      });
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
    this.subscription.unsubscribe();
  }
}
