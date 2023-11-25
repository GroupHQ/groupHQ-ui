import { NgModule } from "@angular/core";
import { NavComponent } from "./nav/nav.component";
import { FooterComponent } from "./footer/footer.component";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AppMediaBreakpointDirective } from "./directives/attr.breakpoint";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { RouterLink } from "@angular/router";
import { LoadingComponent } from "./loading/loading.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { SyncBannerComponent } from "./syncBanner/syncBanner.component";

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterLink,
    MatProgressBarModule,
  ],
  declarations: [
    NavComponent,
    FooterComponent,
    AppMediaBreakpointDirective,
    LoadingComponent,
    SyncBannerComponent,
  ],
  exports: [
    NavComponent,
    FooterComponent,
    AppMediaBreakpointDirective,
    LoadingComponent,
    SyncBannerComponent,
  ],
})
export class SharedModule {}
