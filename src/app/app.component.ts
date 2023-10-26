import { Component, HostBinding } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent {
  title = "groupHQ-UI";
  @HostBinding("class") classes = "page-container";
}
