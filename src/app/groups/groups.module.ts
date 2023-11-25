import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { GroupUtilityBarComponent } from "./groupUtilityBar/groupUtilityBar.component";
import { GroupBoardComponent } from "./groupBoard/groupBoard.component";
import { GroupsComponent } from "./wrapper/groups.component";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { GroupDetailsDialogComponent } from "./dialogs/groupDetailsDialog/groupDetailsDialog.component";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { MatRippleModule } from "@angular/material/core";
import { GroupInputNameDialogComponent } from "./dialogs/groupInputNameDialog/groupInputNameDialog.component";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { GroupCardComponent } from "./groupCard/groupCard.component";
import { AbstractRetryService } from "../services/retry/abstractRetry.service";
import { RetryDefaultService } from "../services/retry/retryDefault.service";
import { GroupCardsComponent } from "./groupCards/groupCards.component";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatRippleModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  declarations: [
    GroupsComponent,
    GroupUtilityBarComponent,
    GroupBoardComponent,
    GroupCardsComponent,
    GroupCardComponent,
    GroupDetailsDialogComponent,
    GroupInputNameDialogComponent,
  ],
  providers: [{ provide: AbstractRetryService, useClass: RetryDefaultService }],
  exports: [GroupsComponent],
})
export class GroupsModule {}
