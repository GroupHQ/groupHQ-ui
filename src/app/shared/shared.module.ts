import {NgModule} from "@angular/core";
import {NavComponent} from "./nav.component";
import {FooterComponent} from "./footer.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
    imports: [MatButtonToggleModule, MatButtonModule],
    declarations: [NavComponent, FooterComponent],
    exports: [NavComponent, FooterComponent]
})
export class SharedModule { }