import { Component, Inject } from "@angular/core";
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogContent,
} from "@angular/material/dialog";
import {
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AppMediaBreakpointDirective } from "../../../shared/directives/attr.breakpoint";
import { GroupModel } from "../../../model/group.model";
import { Subscription } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { v4 as uuidv4 } from "uuid";
import { AsynchronousRequestMediator } from "../../../services/notifications/asynchronousRequest.mediator";
import { GroupJoinRequestEvent } from "../../../model/requestevent/GroupJoinRequestEvent";

@Component({
  selector: "app-group-input-name-modal",
  templateUrl: "groupInputNameDialog.component.html",
  styleUrl: "groupInputNameDialog.component.scss",
  standalone: true,
  imports: [
    AppMediaBreakpointDirective,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDialogContent,
  ],
})
export class GroupInputNameDialogComponent {
  myFormGroup: FormGroup;
  nameField: FormControl = new FormControl("", {
    validators: [Validators.required],
  });
  loading: boolean = false;
  subscription: Subscription | null = null;

  constructor(
    public dialogRef: MatDialogRef<GroupInputNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: GroupModel,
    public readonly userService: UserService,
    private readonly asyncRequestMediator: AsynchronousRequestMediator,
    private formBuilder: FormBuilder,
  ) {
    this.myFormGroup = this.formBuilder.group({
      nameField: this.nameField,
    });
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public joinGroup(): void {
    this.nameField.setValue(this.nameField.value.trim());

    if (this.nameField.invalid) return;

    const joinRequest = new GroupJoinRequestEvent(
      uuidv4(),
      this.group.id,
      this.userService.uuid,
      new Date().toISOString(),
      this.nameField.value,
    );

    this.loading = true;

    this.asyncRequestMediator
      .submitRequestEvent(joinRequest, "groups.join", "groups.updates.user")
      .subscribe({
        complete: () => {
          this.loading = false;
          this.dialogRef.close();
        },
      });
  }
}
