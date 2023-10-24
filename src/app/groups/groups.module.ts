import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {GroupUtilityBarComponent} from "./groupUtilityBar.component";
import {GroupBoardComponent} from "./groupBoard.component";
import {GroupsComponent} from "./groups.component";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {GroupCardComponent} from "./groupCard.component";
import {NgClass, NgForOf} from "@angular/common";
import {GroupDetailsDialogComponent} from "./dialogs/groupDetailsDialog.component";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";
import {MatCardModule} from "@angular/material/card";
import {MatRippleModule} from "@angular/material/core";

@NgModule({
    imports: [SharedModule, MatFormFieldModule, MatSelectModule, NgClass, MatListModule, MatIconModule, MatButtonModule, MatDialogModule, MatCardModule, MatRippleModule, NgForOf],
    declarations: [GroupsComponent, GroupUtilityBarComponent, GroupBoardComponent,
    GroupCardComponent, GroupDetailsDialogComponent],
    exports: [GroupsComponent]
})
export class GroupsModule {}