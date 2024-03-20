import { ChangeDetectorRef, Injectable, QueryList } from "@angular/core";
import { GroupsService } from "./groups.service";
import { PublicEventModel } from "../../model/events/publicEvent.model";
import { GroupModel } from "../../model/group.model";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { map, Subscription } from "rxjs";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import { EventStreamService } from "../../services/notifications/eventStream.service";
import { StateEnum } from "../../services/state/StateEnum";
import { FlipService } from "../../services/animation/flip.service";
import { StateUpdateService } from "./stateUpdate.service";
import { GroupSortingService } from "./groupSorting.service";
import { GroupEventVisitor } from "../../services/notifications/visitors/group/groupEvent.visitor";

/**
 * Manages the currently requested groups and works with other services to
 * store, sort, and update the groups.
 */
@Injectable({
  providedIn: "root",
})
export class GroupManagerService {
  private subscriptions: Subscription = new Subscription();
  private _currentGroupRoute: string | undefined;
  private _changeDetectorRef: ChangeDetectorRef | undefined;

  constructor(
    private readonly groupService: GroupsService,
    private readonly groupSortingService: GroupSortingService,
    private readonly groupEventVisitor: GroupEventVisitor,
    private readonly groupStateService: StateUpdateService,
    private readonly eventStreamService: EventStreamService,
    private readonly flipService: FlipService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.groupSortingService.currentSort$.subscribe((_) => {
      this.commitChange(() => this.groupSortingService.sortGroups(this.groups));
    });
  }

  get groups$() {
    return this.groupService.groups$;
  }

  get groups() {
    return this.groupService.groups;
  }

  get currentGroupRoute() {
    return this._currentGroupRoute;
  }

  get streamRetryTime() {
    if (!this._currentGroupRoute) throw new Error("No current group route");
    return this.eventStreamService.retryTime(this._currentGroupRoute);
  }

  get groupState$() {
    return this.groupStateService.requestState$;
  }

  get groupState() {
    return this.groupStateService.requestState;
  }

  get componentState$() {
    return this.groupStateService.componentState$;
  }

  get componentState() {
    return this.groupStateService.componentState;
  }

  public subscribeToGroupsStream(route: string) {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this._currentGroupRoute = route;

    const groupEventStreamSubscription = this.eventStreamService
      .stream<PublicEventModel>(route)
      .pipe(map((event) => PublicEventModel.instantiate(event)))
      .subscribe((event) => {
        console.debug(`Received ${route} event: `, event);
        const change = () =>
          this.groupStateService.handleEventAndUpdateStates(
            event,
            this.groupEventVisitor,
          );
        this.commitChange(change, event);
      });

    const groupEventStreamStatusSubscription = this.eventStreamService
      .streamStatus(route)
      .subscribe((status) => {
        console.debug(`Received ${route} status: `, status);
        this.groupStateService.handleNewRequestState(status);
      });

    this.subscriptions.add(groupEventStreamSubscription);
    this.subscriptions.add(groupEventStreamStatusSubscription);
  }

  private commitChange(changeFunction: () => void, event?: PublicEventModel) {
    this.animate(
      changeFunction,
      event ? this.mapEventTypeIfGroupDisbanded(event) : EventTypeEnum.NONE,
      event ? event.aggregateId : 0,
    );
  }

  /**
   * Currently, the backend returns a GROUP_UPDATED event when a group is disbanded,
   * therefore, this method is needed to convert the event type to GROUP_DISBANDED as
   * expected by the {@link animate} method.
   * @param event An event
   * @private
   */
  private mapEventTypeIfGroupDisbanded(event: PublicEventModel) {
    if (event.eventType === EventTypeEnum.GROUP_UPDATED) {
      const updatedGroup = event.eventData as GroupModel;
      if (updatedGroup.status !== GroupStatusEnum.ACTIVE) {
        return EventTypeEnum.GROUP_DISBANDED;
      }
    }

    return event.eventType;
  }

  private animate(
    changeFunction: () => void,
    eventType: EventTypeEnum,
    groupId: number,
  ) {
    // Note that currently, the first event processed will always be in a non-ready state
    if (this.groupStateService.componentState !== StateEnum.READY) {
      changeFunction();
      return;
    }

    try {
      if (eventType === EventTypeEnum.GROUP_DISBANDED) {
        this.flipService.animateRemoval(changeFunction, groupId.toString());
      } else {
        this.flipService.animate(changeFunction, this._changeDetectorRef);
      }
    } catch (e) {
      console.warn(
        "Falling back to no animation. There was an error animating group change",
        e,
      );
      changeFunction();
    }
  }

  public setCardComponents(
    components: QueryList<any>,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    console.debug("Setting card components");
    this._changeDetectorRef = changeDetectorRef;
    this.flipService.setComponents(components);
  }
}
