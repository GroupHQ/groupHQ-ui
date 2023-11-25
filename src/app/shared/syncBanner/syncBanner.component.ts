import { Component, Input } from "@angular/core";
import { SyncBannerAnimation } from "./syncBanner.animations";

@Component({
  selector: "app-sync-banner",
  templateUrl: "./syncBanner.component.html",
  styleUrls: ["./syncBanner.component.scss"],
  animations: [SyncBannerAnimation],
})
export class SyncBannerComponent {
  @Input()
  public syncedTextState = false;
}
