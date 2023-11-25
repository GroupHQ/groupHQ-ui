import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./about/about.component";
import { SourcesComponent } from "./sources/sources.component";
import { GroupsComponent } from "./groups/wrapper/groups.component";

const routes: Routes = [
  {
    path: "",
    component: GroupsComponent,
  },
  { path: "about", component: AboutComponent },
  { path: "sources", component: SourcesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
