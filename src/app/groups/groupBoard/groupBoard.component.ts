import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  QueryList,
} from "@angular/core";
import { GroupModel } from "../../model/group.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import {
  FlipService,
  ID_ATTRIBUTE_TOKEN,
} from "../../services/miscellaneous/flip.service";
import { StatesEnum } from "../../model/enums/states.enum";
import { GroupBoardAnimation } from "./groupBoard.animation";
import { GroupCardComponent } from "../groupCard/groupCard.component";
import { ConfigService } from "../../config/config.service";
import { StateTransitionService } from "../../services/miscellaneous/stateTransition.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GroupManagerService } from "../services/groupManager.service";
import { HttpService } from "../../services/network/http.service";
import { IdentificationService } from "../../services/user/identification.service";
import { AbstractRetryService } from "../../services/retry/abstractRetry.service";
import { Subscription } from "rxjs";
import { RsocketPublicUpdateStreamService } from "../../services/network/rsocket/rsocketPublicUpdateStream.service";

@Component({
  selector: "app-group-board",
  templateUrl: "groupBoard.component.html",
  animations: [GroupBoardAnimation],
  providers: [
    FlipService,
    { provide: ID_ATTRIBUTE_TOKEN, useValue: "data-group-id" },
    StateTransitionService,
  ],
})
export class GroupBoardComponent implements OnInit {
  public componentState: StatesEnum = StatesEnum.LOADING;
  public readonly StatesEnum = StatesEnum;
  public subscription: Subscription | null = null;
  public groups: GroupModel[] = [];
  public nextRetry: number | null = null;
  public isGroupsLoaded = false;
  public isGroupsSynced = false;
  public syncedText = false;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
    private readonly flipService: FlipService,
    private readonly stateTransitionService: StateTransitionService,
    private readonly groupManagerService: GroupManagerService,
    private readonly httpService: HttpService,
    private readonly idService: IdentificationService,
    private readonly rsocketPublicUpdateStreamService: RsocketPublicUpdateStreamService,
    private readonly retryDefaultService: AbstractRetryService,
    private readonly configService?: ConfigService,
  ) {}

  ngOnInit() {
    this.rsocketPublicUpdateStreamService.isPublicUpdatesStreamReady$.subscribe(
      (isReady) => {
        if (isReady) {
          this.rsocketPublicUpdateStreamService.publicUpdatesStream$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
              this.groupManagerService.handleUpdates(event);
              console.log("EVENT", event);
            });
        }

        const wasSynced = this.syncedText;

        this.syncedText = isReady;
        this.changeDetectorRef.detectChanges();
        this.isGroupsSynced = isReady;

        if (!wasSynced && isReady) {
          this.stateTransitionService.transitionTo(StatesEnum.NEUTRAL);
          this.loadGroups();
        }
      },
    );

    console.log("nextRetry", this.retryDefaultService.nextRetryInSeconds$);
    this.retryDefaultService.nextRetryInSeconds$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nextRetry) => {
        this.nextRetry = nextRetry;
      });

    this.stateTransitionService.currentState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        console.log("Transitioning to state: " + state);
        this.componentState = state;
      });
    console.log("state stub", this.stateTransitionService);

    this.groupManagerService.groupUpdateActions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((groupUpdate) => {
        console.log("Handling group update");
        if (this.componentState !== StatesEnum.READY) {
          return;
        }

        if (groupUpdate.eventType === EventTypeEnum.GROUP_DISBANDED) {
          this.flipService.animate(
            groupUpdate.updateFunction,
            undefined,
            groupUpdate.groupId.toString(),
          );
        } else {
          this.flipService.animate(
            groupUpdate.updateFunction,
            this.changeDetectorRef,
          );
        }
      });

    this.loadGroups();
  }

  get minimumLoadingTimeSeconds() {
    return this.configService?.getGroupBoardLoadingDelaySeconds ?? 0;
  }

  public loadGroups() {
    this.subscription?.unsubscribe();
    this.nextRetry = null;
    this.transitionState(StatesEnum.LOADING);
    console.log("http stub", this.httpService);
    const username = this.idService.uuid;
    const getGroupsWithRetry = this.retryDefaultService.addRetryLogic(
      this.httpService.getGroups(username),
    );
    this.subscription = getGroupsWithRetry.subscribe({
      next: (groups) => {
        console.log("GOT GROUPS", groups);
        this.groups = groups;
        this.groupManagerService.groups = groups;
        this.transitionState(StatesEnum.READY);
      },
      error: (error) => {
        console.log(error);
        this.transitionState(StatesEnum.HTTP_INTERNAL_SERVER_ERROR);
      },
    });
  }

  public transitionState(state: StatesEnum) {
    console.log("state transition", this.stateTransitionService);
    switch (state) {
      case StatesEnum.HTTP_INTERNAL_SERVER_ERROR:
        this.stateTransitionService.transitionTo(
          StatesEnum.HTTP_INTERNAL_SERVER_ERROR,
        );
        this.isGroupsLoaded = false;
        break;
      case StatesEnum.READY:
        this.stateTransitionService.transitionWithQueuedDelayTo(
          StatesEnum.NEUTRAL,
          this.minimumLoadingTimeSeconds * 1000,
        );
        this.stateTransitionService.transitionWithQueuedDelayTo(
          StatesEnum.READY,
          this.minimumLoadingTimeSeconds * 1000,
        );
        this.isGroupsLoaded = true;
        break;
      case StatesEnum.LOADING:
        if (!this.isGroupsLoaded) {
          this.stateTransitionService.transitionTo(StatesEnum.LOADING);
        } else {
          this.stateTransitionService.transitionWithQueuedDelayTo(
            StatesEnum.NEUTRAL,
            this.minimumLoadingTimeSeconds * 1000,
          );
          this.stateTransitionService.transitionWithQueuedDelayTo(
            StatesEnum.LOADING,
            this.minimumLoadingTimeSeconds * 1000,
          );
          this.isGroupsLoaded = false;
          break;
        }
    }
  }

  public setCardComponents(components: QueryList<GroupCardComponent>) {
    this.flipService.setComponents(components);
    this.groupManagerService.triggerSort();
  }
}