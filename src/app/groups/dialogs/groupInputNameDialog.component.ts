import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-group-input-name-modal",
  templateUrl: "groupInputNameDialog.component.html",
  styleUrls: ["groupInputNameDialog.component.scss"],
})
export class GroupInputNameDialogComponent {
  nameField: FormControl = new FormControl("", {
    validators: [Validators.required],
  });

  constructor(public dialogRef: MatDialogRef<GroupInputNameDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  joinGroup(): void {
    if (this.nameField.invalid) return;

    const result = {
      message: "Successfully joined group!",
    };
    this.dialogRef.close(result);
    console.log("Joining group (not implemented)");
  }
}
