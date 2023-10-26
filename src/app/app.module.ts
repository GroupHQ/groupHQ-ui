import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GroupsModule } from "./groups/groups.module";
import { SharedModule } from "./shared/shared.module";
import { AboutModule } from "./about/about.module";
import { SourcesModule } from "./sources/sources.module";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    GroupsModule,
    SharedModule,
    AboutModule,
    SourcesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
