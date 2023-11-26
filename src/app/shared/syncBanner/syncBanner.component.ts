import { Component, Input } from "@angular/core";
import { SyncBannerAnimation } from "./syncBanner.animations";

@Component({
  selector: "app-sync-banner",
  templateUrl: "./syncBanner.component.html",
  styleUrl: "syncBanner.component.scss",
  animations: [SyncBannerAnimation],
  standalone: true,
})
export class SyncBannerComponent {
  @Input()
  public syncedTextState = false;
}
