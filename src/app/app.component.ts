import { Component, HostBinding } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavComponent } from "./shared/nav/nav.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { RsocketService } from "./services/network/rsocket/rsocket.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent],
})
export class AppComponent {
  title = "groupHQ-UI";
  @HostBinding("class") classes = "page-container";

  constructor(private readonly rsocketService: RsocketService) {
    this.rsocketService.initializeRsocketConnection();
  }
}
