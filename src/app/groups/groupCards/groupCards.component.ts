import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { GroupBoardAnimation } from "./groupCards.animation";
import { GroupModel } from "../../model/group.model";
import { GroupCardComponent } from "../groupCard/groupCard.component";
import { AppMediaBreakpointDirective } from "../../shared/directives/attr.breakpoint";
import { RequestServiceComponentInterface } from "../../services/network/rsocket/mediators/interfaces/requestServiceComponent.interface";
import { MemberModel } from "../../model/member.model";
import { StateEnum } from "../../services/state/StateEnum";
import { RsocketRequestMediatorFactory } from "../../services/network/rsocket/mediators/rsocketRequestMediator.factory";
import { UserService } from "../../services/user/user.service";
import { NotificationService } from "../../services/notifications/notification.service";
import { finalize, Subscription } from "rxjs";

@Component({
  selector: "app-group-cards",
  templateUrl: "./groupCards.component.html",
  styleUrl: "groupCards.component.scss",
  animations: [GroupBoardAnimation],
  standalone: true,
  imports: [AppMediaBreakpointDirective, GroupCardComponent],
})
export class GroupCardsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(GroupCardComponent)
  itemElements!: QueryList<GroupCardComponent>;

  @Output()
  public groupCards = new EventEmitter<QueryList<GroupCardComponent>>();

  @Input()
  groups: GroupModel[] = [];

  @Input()
  isGroupsSynced = false;

  private memberRequestState: StateEnum = StateEnum.INITIALIZING;

  private subscriptions: Subscription = new Subscription();

  constructor(
    readonly rsocketRequestMediatorFactory: RsocketRequestMediatorFactory,
    readonly userService: UserService,
    readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // TODO: Move this fetch logic and its tests to a service class?
    const fetchCurrentMember: RequestServiceComponentInterface<MemberModel> =
      this.rsocketRequestMediatorFactory.createRequestResponseMediator<
        unknown,
        MemberModel
      >("groups.user.member");

    const fetchMemberStatusSubscription = fetchCurrentMember
      .getState$()
      .subscribe((state) => {
        console.log(
          `Current state: ${this.memberRequestState}, new state: ${state}`,
        );
        switch (state) {
          case StateEnum.REQUEST_ACCEPTED:
          case StateEnum.REQUEST_COMPLETED:
            if (this.memberRequestState === StateEnum.RETRYING) {
              this.memberRequestState = state;
              this.notificationService.showMessage(
                "Successfully fetched member data!",
              );
            }
            break;
          case StateEnum.RETRYING:
            this.memberRequestState = StateEnum.RETRYING;
            this.notificationService.showMessage(
              "Retrying to fetch current member data...",
            );
            break;
          case StateEnum.REQUEST_REJECTED:
            this.memberRequestState = StateEnum.REQUEST_REJECTED;
            this.notificationService.showMessage(
              "Failed to fetch current member data ;_;",
            );
            break;
        }
      });

    const fetchMemberSubscription = fetchCurrentMember
      .getEvents$(true)
      .pipe(finalize(() => this.subscriptions.unsubscribe()))
      .subscribe((member) => {
        console.debug("Fetched member for user:", member);
        this.userService.setUserInGroup(member.groupId, member.id);
      });

    this.subscriptions.add(fetchMemberStatusSubscription);
    this.subscriptions.add(fetchMemberSubscription);
  }

  ngAfterViewInit() {
    console.debug("Emitting group cards");
    this.groupCards.emit(this.itemElements);
  }

  trackByItems(index: number, item: GroupModel): number {
    return item.id;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
