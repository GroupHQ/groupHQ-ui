import { Component, Inject } from "@angular/core";
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogClose,
  MAT_DIALOG_DATA,
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
import { RsocketRequestsService } from "../../../services/network/rsocket/requests/rsocketRequests.service";
import { RsocketPrivateUpdateStreamService } from "../../../services/network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { GroupModel } from "../../../model/group.model";
import { Subscription } from "rxjs";
import { EventTypeEnum } from "../../../model/enums/eventType.enum";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";
import { PrivateEventModel } from "../../../model/privateEvent.model";
import { UserService } from "../../../services/user/user.service";
import { MatProgressBarModule } from "@angular/material/progress-bar";

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
  ],
})
export class GroupInputNameDialogComponent {
  myFormGroup: FormGroup;
  nameField: FormControl = new FormControl("", {
    validators: [Validators.required],
  });

  isPrivateUpdateStreamReady: boolean = true;
  errorJoiningGroup: boolean = false;
  loading: boolean = false;
  timeout: number = 5000;
  timeoutId: any;
  subscription: Subscription | null = null;

  constructor(
    public dialogRef: MatDialogRef<GroupInputNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: GroupModel,
    private readonly rsocketRequestsService: RsocketRequestsService,
    private readonly rsocketPrivateUpdateStreamService: RsocketPrivateUpdateStreamService,
    public readonly userService: UserService,
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

    this.isPrivateUpdateStreamReady =
      this.rsocketPrivateUpdateStreamService.isPrivateUpdatesStreamReady;

    if (this.isPrivateUpdateStreamReady) {
      this.loading = true;
      this.errorJoiningGroup = false;
      this.subscription =
        this.rsocketPrivateUpdateStreamService.privateUpdatesStream$.subscribe(
          (privateEvent) => {
            this.handleJoinGroupResponse(privateEvent);
          },
        );

      this.rsocketRequestsService.sendJoinRequest(
        this.nameField.value,
        this.group.id,
        this.userService.uuid,
      );

      this.timeoutId = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.errorJoiningGroup = true;
          this.subscription?.unsubscribe();
        }
      }, this.timeout);
    }
  }

  private handleJoinGroupResponse(privateEvent: PrivateEventModel) {
    if (
      privateEvent.eventType === EventTypeEnum.MEMBER_JOINED &&
      privateEvent.aggregateId === this.group.id
    ) {
      this.loading = false;
      this.subscription?.unsubscribe();
      clearTimeout(this.timeoutId);
      if (privateEvent.eventStatus === EventStatusEnum.SUCCESSFUL) {
        this.dialogRef.close();
      } else {
        this.errorJoiningGroup = true;
      }
    }
  }
}
