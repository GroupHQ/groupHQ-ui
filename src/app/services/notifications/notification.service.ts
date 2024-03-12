import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor(private readonly _snackbar: MatSnackBar) {}

  public showMessage(message: string) {
    console.debug("Sending message: ", message);
    this._snackbar.open(message, "Dismiss", {
      verticalPosition: "top",
      duration: 5000,
    });
  }
}
