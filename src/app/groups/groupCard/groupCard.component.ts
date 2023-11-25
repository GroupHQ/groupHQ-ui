import { Component, ElementRef, Input } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { GroupDetailsDialogComponent } from "../dialogs/groupDetailsDialog/groupDetailsDialog.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Subject, takeUntil } from "rxjs";
import { GroupModel } from "../../model/group.model";
import { NgClass } from "@angular/common";
import { MatRippleModule } from "@angular/material/core";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-group-card",
  templateUrl: "groupCard.component.html",
  styleUrls: ["groupCard.component.scss"],
  standalone: true,
  imports: [MatCardModule, MatRippleModule, NgClass],
})
export class GroupCardComponent {
  @Input() group!: GroupModel;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public dialog: MatDialog,
    private readonly breakpoints$: BreakpointObserver,
    private elementRef: ElementRef,
  ) {}

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = "100vw"; // overrides default in-line style of 80vw
    dialogConfig.maxHeight = "100vh";
    dialogConfig.data = this.group;

    const dialogRef = this.dialog.open(
      GroupDetailsDialogComponent,
      dialogConfig,
    );

    // see styles.css for full-screen-modal class
    this.breakpoints$
      .observe(Breakpoints.Handset)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.matches) {
          dialogRef.addPanelClass("full-screen-modal");
        } else {
          dialogRef.removePanelClass("full-screen-modal");
        }
      });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed. Result:", result);
      this.destroy$.next();
      this.destroy$.complete();
    });
  }

  getRootElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
