import {Component} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: "app-group-details-dialog",
    templateUrl: "groupDetailsDialog.component.html",
    styleUrls: ["groupDetailsDialog.component.scss"]
})
export class GroupDetailsDialogComponent {
    numbers: number[] = Array(7).fill(0).map((x,i)=>i);

    constructor(public dialogRef: MatDialogRef<GroupDetailsDialogComponent>,
                // @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    onNoClick(): void {
        this.dialogRef.close()
    }
}