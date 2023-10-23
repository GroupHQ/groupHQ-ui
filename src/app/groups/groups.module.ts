import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {GroupUtilityBarComponent} from "./groupUtilityBar.component";
import {GroupBoardComponent} from "./groupBoard.component";
import {GroupsComponent} from "./groups.component";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {GroupCardComponent} from "./groupCard.component";
import {NgClass} from "@angular/common";

@NgModule({
    imports: [SharedModule, MatFormFieldModule, MatSelectModule, NgClass],
    declarations: [GroupsComponent, GroupUtilityBarComponent, GroupBoardComponent,
    GroupCardComponent],
    exports: [GroupsComponent]
})
export class GroupsModule {}