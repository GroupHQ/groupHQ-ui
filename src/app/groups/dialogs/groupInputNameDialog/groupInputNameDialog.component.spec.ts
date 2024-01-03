import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { GroupInputNameDialogComponent } from "./groupInputNameDialog.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { RsocketRequestsService } from "../../../services/network/rsocket/requests/rsocketRequests.service";
import { RsocketPrivateUpdateStreamService } from "../../../services/network/rsocket/streams/rsocketPrivateUpdateStream.service";
import { UserService } from "../../../services/user/user.service";
import { PrivateEventModel } from "../../../model/privateEvent.model";
import { v4 as uuidv4 } from "uuid";
import { AggregateTypeEnum } from "../../../model/enums/aggregateType.enum";
import { EventTypeEnum } from "../../../model/enums/eventType.enum";
import { MemberModel } from "../../../model/member.model";
import { MemberStatusEnum } from "../../../model/enums/memberStatus.enum";
import { EventStatusEnum } from "../../../model/enums/eventStatus.enum";
import { cold, getTestScheduler } from "jasmine-marbles";
import { GroupModel } from "../../../model/group.model";
import { GroupStatusEnum } from "../../../model/enums/groupStatus.enum";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";

const mockGroup: GroupModel = {
  id: 1,
  title: "Test Group",
  description: "Test Group Description",
  maxGroupSize: 10,
  createdDate: new Date().toISOString(),
  lastModifiedDate: new Date().toISOString(),
  createdBy: "Test User",
  lastModifiedBy: "Test User",
  version: 1,
  status: GroupStatusEnum.ACTIVE,
  members: [],
};

const mockMember: MemberModel = {
  id: 1,
  username: "Test User",
  groupId: 1,
  memberStatus: MemberStatusEnum.ACTIVE,
  joinedDate: new Date().toISOString(),
  exitedDate: null,
};

const mockPrivateEvent: PrivateEventModel = {
  eventId: uuidv4(),
  aggregateId: 1,
  websocketId: uuidv4(),
  aggregateType: AggregateTypeEnum.GROUP,
  eventType: EventTypeEnum.MEMBER_JOINED,
  eventData: JSON.stringify(mockMember),
  eventStatus: EventStatusEnum.SUCCESSFUL,
  createdDate: new Date().toISOString(),
};

describe("GroupInputNameDialogComponent", () => {
  let component: GroupInputNameDialogComponent;
  let fixture: ComponentFixture<GroupInputNameDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GroupInputNameDialogComponent>>;
  let userService: jasmine.SpyObj<any>;
  let rsocketRequestsServiceSpy: jasmine.SpyObj<RsocketRequestsService>;
  let rsocketPrivateUpdateStreamServiceSpy: jasmine.SpyObj<RsocketPrivateUpdateStreamService>;
  let page: Page;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);

    userService = {
      mockUuid: uuidv4(),
      get uuid(): string {
        return this.mockUuid;
      },
    };

    rsocketRequestsServiceSpy = jasmine.createSpyObj("RsocketRequestsService", [
      "sendJoinRequest",
    ]);
    rsocketPrivateUpdateStreamServiceSpy = jasmine.createSpyObj(
      "RsocketPrivateUpdateStreamService",
      ["initializePrivateUpdateStream"],
    );
    Object.defineProperty(
      rsocketPrivateUpdateStreamServiceSpy,
      "isPrivateUpdatesStreamReady",
      {
        get: () => true,
        configurable: true,
      },
    );
    Object.defineProperty(
      rsocketPrivateUpdateStreamServiceSpy,
      "privateUpdatesStream$",
      {
        get: () => cold("a", { a: mockPrivateEvent }),
      },
    );

    await TestBed.configureTestingModule({
      imports: [
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatButtonModule,
        GroupInputNameDialogComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockGroup },
        { provide: UserService, useValue: userService },
        {
          provide: RsocketRequestsService,
          useValue: rsocketRequestsServiceSpy,
        },
        {
          provide: RsocketPrivateUpdateStreamService,
          useValue: rsocketPrivateUpdateStreamServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupInputNameDialogComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
  });

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.isPrivateUpdateStreamReady).toBe(true);
    expect(component.errorJoiningGroup).toBe(false);
  });

  describe("joinGroup", () => {
    beforeEach(() => {
      component.nameField.setValue("Test User");
      fixture.detectChanges();
    });

    it("should let the user submit their name", () => {
      component.nameField.setValue("");
      fixture.detectChanges();
      expect(page.isJoinButtonDisabled).toBeTrue();

      component.nameField.setValue("Test User");
      fixture.detectChanges();

      expect(page.isJoinButtonEnabled).toBeTrue();
      page.submitName();

      expect(
        rsocketRequestsServiceSpy.sendJoinRequest,
      ).toHaveBeenCalledOnceWith(
        component.nameField.value,
        mockGroup.id,
        userService.uuid,
      );

      getTestScheduler().flush();

      expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
    });

    it("should not let the user submit an invalid name", () => {
      component.nameField.setValue("");

      fixture.detectChanges();
      expect(page.isJoinButtonDisabled).toBeTrue();

      component.joinGroup();

      expect(rsocketRequestsServiceSpy.sendJoinRequest).toHaveBeenCalledTimes(
        0,
      );

      getTestScheduler().flush();

      expect(dialogRefSpy.close.calls.count()).toBe(0);
      expect(component.nameField.hasError("required")).toBeTrue();
    });

    it("should not let the user submit a name with only spaces", () => {
      component.nameField.setValue("    ");
      fixture.detectChanges();

      expect(page.isJoinButtonDisabled).toBeFalse();

      component.joinGroup();
      fixture.detectChanges();

      expect(page.isJoinButtonDisabled).toBeTrue();

      expect(rsocketRequestsServiceSpy.sendJoinRequest).toHaveBeenCalledTimes(
        0,
      );

      getTestScheduler().flush();

      expect(dialogRefSpy.close.calls.count()).toBe(0);
      expect(component.nameField.hasError("required")).toBeTrue();
    });

    it("should save the subscription and close it after receiving a response", () => {
      page.submitName();

      expect(component.subscription).toBeTruthy();
      expect(component.subscription?.closed).toBeFalse();

      getTestScheduler().flush();

      expect(component.subscription?.closed).toBeTrue();
    });

    it("should unsubscribe from the subscription when the timeout is reached", () => {
      page.submitName();

      expect(component.subscription).toBeTruthy();
      expect(component.subscription?.closed).toBeFalse();

      jasmine.clock().tick(component.timeout + 1);

      expect(component.subscription?.closed).toBeTrue();
    });

    it("should not trigger the timeout if a response is received before the timeout", () => {
      page.submitName();

      getTestScheduler().flush();

      jasmine.clock().tick(component.timeout + 1);

      expect(component.errorJoiningGroup).toBeFalse();
    });

    it("should set the loading state to true when awaiting a response", () => {
      page.submitName();
      fixture.detectChanges();

      expect(page.isLoadingVisible).toBeTrue();

      expect(component.loading).toBeTrue();
    });

    it("should set the loading state to false when timeout is reached", () => {
      page.submitName();

      fixture.detectChanges();

      expect(component.loading).toBeTrue();
      expect(page.isLoadingVisible).toBeTrue();

      getTestScheduler().flush();

      jasmine.clock().tick(component.timeout + 1);
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(page.isLoadingVisible).toBeFalse();
    });

    it("should set the loading state to false when a response is received", () => {
      page.submitName();

      fixture.detectChanges();

      expect(component.loading).toBeTrue();
      expect(page.isLoadingVisible).toBeTrue();

      getTestScheduler().flush();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(page.isLoadingVisible).toBeFalse();
    });
  });

  describe("error state", () => {
    it("should not show errors in a normal state", () => {
      fixture.detectChanges();
      expect(page.isErrorVisible).toBeFalse();
    });

    it("should show an error if loading time exceeds timeout", async () => {
      component.nameField.setValue("Test User");
      fixture.detectChanges();

      page.submitName();
      fixture.detectChanges();

      expect(component.loading).toBeTrue();
      expect(page.isLoadingVisible).toBeTrue();

      jasmine.clock().tick(component.timeout + 1);
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(page.isLoadingVisible).toBeFalse();
      expect(page.isErrorVisible).toBeTrue();
      expect(page.isServerUnavailableErrorVisible).toBeTrue();
    });

    it("should show an error if the private update stream is not ready", () => {
      component.nameField.setValue("Test User");
      fixture.detectChanges();

      Object.defineProperty(
        rsocketPrivateUpdateStreamServiceSpy,
        "isPrivateUpdatesStreamReady",
        {
          get: () => false,
        },
      );
      page.submitName();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.isPrivateUpdateStreamReady).toBeFalse();
      expect(page.isErrorVisible).toBeTrue();
      expect(page.isStreamErrorVisible).toBeTrue();
    });
  });
});

class Page {
  private _element: HTMLElement;

  constructor(fixture: ComponentFixture<GroupInputNameDialogComponent>) {
    this._element = fixture.nativeElement;
  }

  get isErrorVisible(): boolean {
    return (
      this.isNameInputErrorVisible ||
      this.isStreamErrorVisible ||
      this.isServerUnavailableErrorVisible
    );
  }

  public submitName() {
    const submitButton = this._element.querySelector<HTMLFormElement>(
      "[data-test='join-group-button']",
    );
    const loadingElement = this._element.querySelector<HTMLElement>(
      "[data-test='loading-progress-bar']",
    );

    if (!submitButton && loadingElement) {
      throw new Error("Submit button not found; loading element found instead");
    } else if (!submitButton) {
      throw new Error("Submit button not found; loading element not found");
    } else if (submitButton.getAttribute("disabled") === "true") {
      throw new Error("Submit button is disabled");
    }

    submitButton.click();
  }

  get isNameInputErrorVisible(): boolean {
    const errorElement = this._element.querySelector<HTMLElement>(
      "[data-test='name-input-error']",
    );

    return errorElement !== null;
  }

  get isStreamErrorVisible(): boolean {
    const errorElement = this._element.querySelector<HTMLElement>(
      "[data-test='stream-error']",
    );

    return errorElement !== null;
  }

  get isServerUnavailableErrorVisible(): boolean {
    const errorElement = this._element.querySelector<HTMLElement>(
      "[data-test='server-unavailable-error']",
    );

    return errorElement !== null;
  }

  get isJoinButtonDisabled(): boolean {
    const joinButton = this._element.querySelector<HTMLElement>(
      "[data-test='join-group-button']",
    );
    return joinButton?.getAttribute("disabled") === "true" ?? false;
  }

  get isJoinButtonEnabled(): boolean {
    return !this.isJoinButtonDisabled;
  }

  get isLoadingVisible(): boolean {
    const loadingElement = this._element.querySelector<HTMLElement>(
      "[data-test='loading-progress-bar']",
    );

    return loadingElement !== null;
  }
}
