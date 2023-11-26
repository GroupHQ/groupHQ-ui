import { Component, Input } from "@angular/core";
import { AppLoadingAnimation } from "./loading.animations";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { AppMediaBreakpointDirective } from "../directives/attr.breakpoint";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrl: "loading.component.scss",
  animations: [AppLoadingAnimation],
  standalone: true,
  imports: [AppMediaBreakpointDirective, MatProgressBarModule, MatButtonModule],
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
