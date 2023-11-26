import { Routes } from "@angular/router";
import { AboutComponent } from "./about/about.component";
import { SourcesComponent } from "./sources/sources.component";
import { GroupsComponent } from "./groups/wrapper/groups.component";

export const AppRoutes: Routes = [
  {
    path: "",
    component: GroupsComponent,
  },
  { path: "about", component: AboutComponent },
  { path: "sources", component: SourcesComponent },
];
