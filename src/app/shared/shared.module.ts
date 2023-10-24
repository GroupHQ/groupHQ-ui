import {NgModule} from "@angular/core";
import {NavComponent} from "./nav.component";
import {FooterComponent} from "./footer.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {GhqMediaBreakpointDirective} from "./attr.breakpoint";
import {NgClass, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatListModule} from "@angular/material/list";

@NgModule({
    imports: [MatToolbarModule, MatButtonToggleModule, MatButtonModule, NgSwitch, NgSwitchCase, NgTemplateOutlet, MatIconModule, MatExpansionModule, MatListModule, NgIf, NgClass],
    declarations: [NavComponent, FooterComponent, GhqMediaBreakpointDirective],
    exports: [NavComponent, FooterComponent, GhqMediaBreakpointDirective]
})
export class SharedModule { }