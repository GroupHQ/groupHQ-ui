import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from "@angular/core";
import { GroupBoardAnimation } from "./groupBoard.animation";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GroupManagerService } from "../services/groupManager.service";
import { delay, of, Subscription } from "rxjs";
import { GroupCardsComponent } from "../groupCards/groupCards.component";
import { LoadingComponent } from "../../shared/loading/loading.component";
import { SyncBannerComponent } from "../../shared/syncBanner/syncBanner.component";
import { StateEnum } from "src/app/services/state/StateEnum";

@Component({
  selector: "app-group-board",
  templateUrl: "groupBoard.component.html",
  animations: [GroupBoardAnimation],
  standalone: true,
  imports: [SyncBannerComponent, LoadingComponent, GroupCardsComponent],
})
export class GroupBoardComponent implements OnInit {
  public subscription: Subscription | null = null;
  public nextRetry: number | null = null;
  public isGroupsLoaded = false;
  public isGroupsSynced = false;
  public syncedText = false;
  public componentState: StateEnum = StateEnum.INITIALIZING;
  protected readonly ComponentStatesEnum = StateEnum;
  private readonly GROUPS_ROUTE = "groups.updates.all";
  public readonly initializingTimeout = 400;

  constructor(
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
    public readonly groupManagerService: GroupManagerService,
  ) {
    this.setInitialStates();
  }

  private setInitialStates() {
    this.isGroupsLoaded =
      this.groupManagerService.componentState === StateEnum.READY;
    this.syncedText = this.groupManagerService.groupState === StateEnum.READY;
    this.isGroupsSynced = this.syncedText;
  }

  ngOnInit(): void {
    this.setLoadingIfInitializingTimeout();

    if (this.groupManagerService.currentGroupRoute !== this.GROUPS_ROUTE) {
      this.groupManagerService.subscribeToGroupsStream(this.GROUPS_ROUTE);
    }

    this.groupManagerService.componentState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        this.componentState = status;
        this.setGroupsLoadedIfReady(status);
      });

    this.groupManagerService.groupState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        this.updateSyncBanner(status);
        this.updateNextRetryIfRetrying(status);
      });
  }

  private updateSyncBanner(status: StateEnum) {
    this.syncedText = status === StateEnum.READY;
    if (status === StateEnum.READY) this.changeDetectorRef.detectChanges();
    this.isGroupsSynced = status === StateEnum.READY;
  }

  private setGroupsLoadedIfReady(status: StateEnum) {
    if (status === StateEnum.READY) {
      this.isGroupsLoaded = true;
    }
  }

  private updateNextRetryIfRetrying(status: StateEnum) {
    if (status === StateEnum.RETRYING) {
      console.debug("Retrying state detected, updating next retry time");
      this.groupManagerService.streamRetryTime?.subscribe((nextRetry) => {
        this.nextRetry = nextRetry;
      });
    }
  }

  private setLoadingIfInitializingTimeout() {
    of(StateEnum.LOADING)
      .pipe(delay(this.initializingTimeout))
      .subscribe((status) => {
        if (this.componentState === StateEnum.INITIALIZING) {
          console.debug("Initializing timeout, loading state triggerred");
          this.componentState = status;
        }
      });
  }
}
