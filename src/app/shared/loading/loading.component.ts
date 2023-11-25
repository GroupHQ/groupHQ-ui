import { Component, Input } from "@angular/core";
import { AppLoadingAnimation } from "./loading.animations";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.scss"],
  animations: [AppLoadingAnimation],
})
export class LoadingComponent {
  @Input()
  itemName: string | null = null;

  @Input()
  nextRetry: number | null = null;

  @Input()
  minimumLoadingTimeSeconds = 1;

  @Input()
  retryFunction: (() => void) | null = null;

  @Input()
  loading = true;

  get shouldShowRetryButton(): boolean {
    return (this.nextRetry && this.nextRetry > 0) || !this.loading;
  }
}
