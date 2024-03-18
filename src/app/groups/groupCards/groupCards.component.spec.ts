import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupCardsComponent } from "./groupCards.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GroupModel } from "../../model/group.model";
import { trigger } from "@angular/animations";
import { ConfigService } from "../../config/config.service";
import { Component, Input } from "@angular/core";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { RequestServiceComponentInterface } from "../../services/network/rsocket/mediators/interfaces/requestServiceComponent.interface";
import { RsocketRequestMediatorFactory } from "../../services/network/rsocket/mediators/rsocketRequestMediator.factory";
import { MemberModel } from "../../model/member.model";
import { UserService } from "../../services/user/user.service";
import { NEVER } from "rxjs";
import { StateEnum } from "../../services/state/StateEnum";
import { NotificationService } from "../../services/notifications/notification.service";

@Component({
  standalone: true,
  selector: "app-group-card",
  template: "",
})
class GroupCardStubComponent {
  @Input() group!: GroupModel;
}

describe("GroupCardsComponent", () => {
  let fixture: ComponentFixture<GroupCardsComponent>;
  let component: GroupCardsComponent;
  let page: Page;

  beforeEach(() => {
    const groups: Partial<GroupModel>[] = [{ id: 1 }, { id: 2 }];

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: {} }],
    })
      .overrideComponent(GroupCardsComponent, {
        set: {
          imports: [GroupCardStubComponent],
          animations: [
            trigger("groupBoardAnimation", []),
            trigger("groupBoardNoGroupsMessage", []),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GroupCardsComponent);
    component = fixture.componentInstance;
    component.groups = groups as GroupModel[];

    page = new Page(fixture);
  });

  describe("groups exist state", () => {
    it("renders the group cards when there exists at least one group", () => {
      fixture.detectChanges();
      expect(component.groups.length).toBeGreaterThan(0);
      expect(page.groupCardsContainer).toBeTruthy();
      expect(page.noGroupsMessageContainer).toBeFalsy();
    });
  });

  describe("no groups state", () => {
    beforeEach(() => {
      component.groups = [];
      fixture.detectChanges();
    });

    it("renders the no groups message elements when there are no groups", () => {
      expect(page.groupCardsContainer).toBeFalsy();
      expect(page.noGroupsMessageContainer).toBeTruthy();
    });

    it("should render the no groups message whether synced or not", () => {
      component.isGroupsSynced = true;
      fixture.detectChanges();
      expect(page.noGroupsMessage).toBeTruthy();

      component.isGroupsSynced = false;
      fixture.detectChanges();
      expect(page.noGroupsMessage).toBeTruthy();
    });

    it("should render the additional sync message when the groups are synced", () => {
      component.isGroupsSynced = true;
      fixture.detectChanges();
      expect(page.noGroupsMessageSyncedText).toBeTruthy();
    });

    it("should not render the additional sync message when the groups are not synced", () => {
      component.isGroupsSynced = false;
      fixture.detectChanges();
      expect(page.noGroupsMessageSyncedText).toBeFalsy();
    });
  });

  it("renders the no groups message elements when there are no groups", () => {
    component.groups = [];
    fixture.detectChanges();
    expect(page.groupCardsContainer).toBeFalsy();
    expect(page.noGroupsMessageContainer).toBeTruthy();
  });

  describe("member fetch", () => {
    let rsocketRequestMediatorFactory: RsocketRequestMediatorFactory;
    let requestServiceComponentInterfaceSpy: jasmine.SpyObj<
      RequestServiceComponentInterface<MemberModel>
    >;
    let userService: UserService;
    let notificationService: NotificationService;
    let testScheduler: TestScheduler;

    beforeEach(() => {
      userService = TestBed.inject(UserService);
      notificationService = TestBed.inject(NotificationService);
      spyOn(notificationService, "showMessage");

      rsocketRequestMediatorFactory = TestBed.inject(
        RsocketRequestMediatorFactory,
      );

      requestServiceComponentInterfaceSpy = jasmine.createSpyObj(
        "RequestServiceComponentInterface",
        ["getEvents$", "getState$"],
      );

      spyOn(
        rsocketRequestMediatorFactory,
        "createRequestResponseMediator",
      ).and.returnValue(requestServiceComponentInterfaceSpy);

      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it("should set the user's group and member status if fetch is successful", () => {
      testScheduler.run(({ cold, flush }) => {
        const member: Partial<MemberModel> = { id: 1, groupId: 1 };
        requestServiceComponentInterfaceSpy.getState$.and.returnValue(NEVER);
        requestServiceComponentInterfaceSpy.getEvents$.and.returnValue(
          cold("a|", { a: member as MemberModel }),
        );

        fixture.detectChanges();
        flush();

        expect(userService.currentMemberId).toBe(member.id!);
        expect(userService.currentGroupId).toBe(member.groupId!);
        expect(notificationService.showMessage).toHaveBeenCalledTimes(0);
      });
    });

    it("should show a message if the fetch is retrying", () => {
      testScheduler.run(({ cold, flush }) => {
        requestServiceComponentInterfaceSpy.getState$.and.returnValue(
          cold("a|", { a: StateEnum.RETRYING }),
        );
        requestServiceComponentInterfaceSpy.getEvents$.and.returnValue(NEVER);

        fixture.detectChanges();
        flush();

        expect(notificationService.showMessage).toHaveBeenCalledWith(
          "Retrying to fetch current member data...",
        );
      });
    });

    it("should show a message if the fetch request was rejected", () => {
      testScheduler.run(({ cold, flush }) => {
        requestServiceComponentInterfaceSpy.getState$.and.returnValue(
          cold("a|", { a: StateEnum.REQUEST_REJECTED }),
        );
        requestServiceComponentInterfaceSpy.getEvents$.and.returnValue(NEVER);

        fixture.detectChanges();
        flush();

        expect(notificationService.showMessage).toHaveBeenCalledWith(
          "Failed to fetch current member data ;_;",
        );
      });
    });

    it("should show a message if the fetch request was successful after retrying", () => {
      testScheduler.run(({ cold, flush }) => {
        requestServiceComponentInterfaceSpy.getState$.and.returnValue(
          cold("ab|", { a: StateEnum.RETRYING, b: StateEnum.REQUEST_ACCEPTED }),
        );
        requestServiceComponentInterfaceSpy.getEvents$.and.returnValue(NEVER);

        fixture.detectChanges();
        flush();

        expect(notificationService.showMessage).toHaveBeenCalledWith(
          "Successfully fetched member data!",
        );
      });
    });
  });
});

class Page {
  private readonly _testHostComponent: HTMLElement;

  constructor(readonly fixture: ComponentFixture<GroupCardsComponent>) {
    this._testHostComponent = fixture.nativeElement;
  }

  get testHostComponent() {
    return this._testHostComponent;
  }

  get groupCardsContainer() {
    return this.testHostComponent.querySelector<HTMLElement>(
      '[data-test="group-cards"]',
    );
  }

  get noGroupsMessageContainer() {
    return this.testHostComponent.querySelector<HTMLElement>(
      '[data-test="group-cards--no-groups-message"]',
    );
  }

  get noGroupsMessage() {
    return this.testHostComponent.querySelector(
      '[data-test="no-groups-message__text"]',
    );
  }

  get noGroupsMessageSyncedText() {
    return this.testHostComponent.querySelector(
      '[data-test="no-groups-message__sync-text"]',
    );
  }
}
