import {NgModule} from "@angular/core";
import {NavComponent} from "./nav.component";
import {FooterComponent} from "./footer.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {GhqMediaBreakpointDirective} from "./attr.breakpoint";

@NgModule({
    imports: [MatToolbarModule,MatButtonToggleModule, MatButtonModule],
    declarations: [NavComponent, FooterComponent, GhqMediaBreakpointDirective],
    exports: [NavComponent, FooterComponent, GhqMediaBreakpointDirective]
})
export class SharedModule { }