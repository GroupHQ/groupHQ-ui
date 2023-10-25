import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { GroupInputNameDialogComponent } from "./groupInputNameDialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-group-details-dialog",
  templateUrl: "groupDetailsDialog.component.html",
  styleUrls: ["groupDetailsDialog.component.scss"],
})
export class GroupDetailsDialogComponent {
  numbers: number[] = Array(7)
    .fill(0)
    .map((x, i) => i);

  constructor(
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GroupDetailsDialogComponent>,
    public dialog: MatDialog, // @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

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

  onNoClick(): void {
    this.dialogRef.close();
  }
}
