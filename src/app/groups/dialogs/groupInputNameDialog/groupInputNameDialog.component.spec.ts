import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupInputNameDialogComponent } from "./groupInputNameDialog.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AsynchronousRequestMediator } from "../../../services/network/rsocket/mediators/asynchronousRequest.mediator";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ConfigService } from "../../../config/config.service";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { GroupJoinRequestEvent } from "../../../model/requestevent/GroupJoinRequestEvent";

describe("GroupInputNameDialogComponent", () => {
  let component: GroupInputNameDialogComponent;
  let fixture: ComponentFixture<GroupInputNameDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GroupInputNameDialogComponent>>;
  let asyncRequestMediator: AsynchronousRequestMediator;
  let page: Page;
  const groupId = 1;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { id: groupId } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: ConfigService, useValue: {} },
      ],
    });

    fixture = TestBed.createComponent(GroupInputNameDialogComponent);
    component = fixture.componentInstance;
    asyncRequestMediator = TestBed.inject(AsynchronousRequestMediator);
    page = new Page(fixture);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe("joinGroup", () => {
    beforeEach(() => {
      component.nameField.setValue("Test User");
      fixture.detectChanges();
    });

    it("should disable the join button if the name field is empty", () => {
      component.nameField.setValue("");
      fixture.detectChanges();
      expect(page.isJoinButtonDisabled).toBeTrue();
    });

    it("should disable the join button if attempting to submit a name with only white space", () => {
      component.nameField.setValue("            ");
      fixture.detectChanges();
      page.submitName();
      fixture.detectChanges();

      expect(page.isJoinButtonDisabled).toBeTrue();
      expect(page.isMemberNameRequiredErrorVisible).toBeTrue();
    });

    it("should enable the join button if the name field is not empty", () => {
      component.nameField.setValue("A");
      fixture.detectChanges();
      expect(page.isJoinButtonEnabled).toBeTrue();
    });

    it("should let the user submit their name", () => {
      component.nameField.setValue("Test User");
      fixture.detectChanges();

      testScheduler.run(({ cold, flush }) => {
        spyOn(asyncRequestMediator, "submitRequestEvent").and.returnValue(
          cold("|"),
        );
        page.submitName();

        flush();

        expect(
          asyncRequestMediator.submitRequestEvent,
        ).toHaveBeenCalledOnceWith(
          jasmine.any(GroupJoinRequestEvent),
          "groups.join",
          "groups.updates.user",
        );

        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
      });

      expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
    });

    it("should not process requests with no name", () => {
      spyOn(asyncRequestMediator, "submitRequestEvent");

      component.nameField.setValue("");
      component.joinGroup();

      expect(asyncRequestMediator.submitRequestEvent).toHaveBeenCalledTimes(0);

      expect(component.nameField.hasError("required")).toBeTrue();
    });

    it("should not process requests with a name that has only spaces", () => {
      spyOn(asyncRequestMediator, "submitRequestEvent");

      component.nameField.setValue("    ");
      component.joinGroup();

      expect(asyncRequestMediator.submitRequestEvent).toHaveBeenCalledTimes(0);

      expect(dialogRefSpy.close.calls.count()).toBe(0);
      expect(component.nameField.hasError("required")).toBeTrue();
    });

    it("should set the loading state to true when awaiting a response", () => {
      page.submitName();
      fixture.detectChanges();

      expect(component.loading).toBeTrue();
      expect(page.isLoadingVisible).toBeTrue();
    });

    it("should set the loading state to false when the request completes", () => {
      testScheduler.run(({ cold, flush }) => {
        spyOn(asyncRequestMediator, "submitRequestEvent").and.returnValue(
          cold("|"),
        );

        page.submitName();
        fixture.detectChanges();

        expect(component.loading).toBeTrue();
        expect(page.isLoadingVisible).toBeTrue();

        flush();

        fixture.detectChanges();

        expect(component.loading).toBeFalse();
        expect(page.isLoadingVisible).toBeFalse();
      });
    });
  });
});

class Page {
  private _element: HTMLElement;

  constructor(fixture: ComponentFixture<GroupInputNameDialogComponent>) {
    this._element = fixture.nativeElement;
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

  get isMemberNameRequiredErrorVisible(): boolean {
    const errorElement = this._element.querySelector<HTMLElement>(
      "[data-test='member-name-required-error']",
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
