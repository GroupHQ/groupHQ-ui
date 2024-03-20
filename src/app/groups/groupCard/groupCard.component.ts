import { Component, ElementRef, Input, OnDestroy } from "@angular/core";
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from "@angular/material/dialog";
import { GroupDetailsDialogComponent } from "../dialogs/groupDetailsDialog/groupDetailsDialog.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Subject, takeUntil } from "rxjs";
import { GroupModel } from "../../model/group.model";
import { NgClass } from "@angular/common";
import { MatRippleModule } from "@angular/material/core";
import { MatCardModule } from "@angular/material/card";
import { UserService } from "../../services/user/user.service";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-group-card",
  templateUrl: "groupCard.component.html",
  styleUrl: "groupCard.component.scss",
  standalone: true,
  imports: [MatCardModule, MatRippleModule, NgClass, MatIconModule],
})
export class GroupCardComponent implements OnDestroy {
  @Input() group!: GroupModel;

  private readonly destroy$ = new Subject<void>();
  public groupDetailsDialogRef: MatDialogRef<GroupDetailsDialogComponent> | null =
    null;

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    private readonly breakpoints$: BreakpointObserver,
    private elementRef: ElementRef,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.groupDetailsDialogRef?.close();
  }

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = "100vw"; // overrides default in-line style of 80vw
    dialogConfig.maxHeight = "100%";
    dialogConfig.data = this.group;
    dialogConfig.ariaLabelledBy = "group-details-dialog-title";
    dialogConfig.ariaDescribedBy = "group-details-dialog-description";

    this.groupDetailsDialogRef = this.dialog.open(
      GroupDetailsDialogComponent,
      dialogConfig,
    );

    // see styles.css for full-screen-modal class
    this.breakpoints$
      .observe(Breakpoints.Handset)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.matches) {
          this.groupDetailsDialogRef?.addPanelClass("full-screen-modal");
        } else {
          this.groupDetailsDialogRef?.removePanelClass("full-screen-modal");
        }
      });

    this.groupDetailsDialogRef.afterClosed().subscribe((result) => {
      console.debug("The dialog was closed. Result:", result);
      this.destroy$.next();
      this.destroy$.complete();
    });
  }

  getRootElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
