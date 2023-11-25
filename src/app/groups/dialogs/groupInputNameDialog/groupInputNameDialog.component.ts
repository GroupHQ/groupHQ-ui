import { Component } from "@angular/core";
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogClose,
} from "@angular/material/dialog";
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AppMediaBreakpointDirective } from "../../../shared/directives/attr.breakpoint";

@Component({
  selector: "app-group-input-name-modal",
  templateUrl: "groupInputNameDialog.component.html",
  styleUrls: ["groupInputNameDialog.component.scss"],
  standalone: true,
  imports: [
    AppMediaBreakpointDirective,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogClose,
  ],
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
