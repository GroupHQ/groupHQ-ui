import { NgModule } from "@angular/core";
import { NavComponent } from "./nav.component";
import { FooterComponent } from "./footer.component";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AppMediaBreakpointDirective } from "./attr.breakpoint";
import { NgClass, NgIf, NgSwitch, NgSwitchCase } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { RouterLink } from "@angular/router";

@NgModule({
  imports: [
    MatToolbarModule,
    MatButtonModule,
    NgSwitch,
    NgSwitchCase,
    MatIconModule,
    MatListModule,
    NgIf,
    NgClass,
    RouterLink,
  ],
  declarations: [NavComponent, FooterComponent, AppMediaBreakpointDirective],
  exports: [NavComponent, FooterComponent, AppMediaBreakpointDirective],
})
export class SharedModule {}
