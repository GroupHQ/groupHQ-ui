import { TestBed } from "@angular/core/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotificationService } from "./notification.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj("MatSnackBar", ["open"]);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  describe("#showMessage", () => {
    it("should show message using MatSnackBar", () => {
      const testMessage = "Test message";

      service.showMessage(testMessage);

      expect(snackBarSpy.open).toHaveBeenCalledWith(testMessage, "Dismiss", {
        verticalPosition: "top",
        duration: 5000,
      });
    });
  });
});
