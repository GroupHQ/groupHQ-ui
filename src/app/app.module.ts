import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GroupsModule } from "./groups/groups.module";
import { SharedModule } from "./shared/shared.module";
import { AboutModule } from "./about/about.module";
import { SourcesModule } from "./sources/sources.module";
import { HttpClientModule } from "@angular/common/http";
import { ConfigModule } from "./config/config.module";
import { RetryForeverConstantService } from "./services/retry/retryForeverConstant.service";
import { RetryDefaultService } from "./services/retry/retryDefault.service";
import { RETRY_DEFAULT, RETRY_FOREVER } from "./app-tokens";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ConfigModule,
    BrowserAnimationsModule,
    GroupsModule,
    SharedModule,
    AboutModule,
    SourcesModule,
    HttpClientModule,
  ],
  providers: [
    { provide: RETRY_DEFAULT, useClass: RetryDefaultService },
    { provide: RETRY_FOREVER, useClass: RetryForeverConstantService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
