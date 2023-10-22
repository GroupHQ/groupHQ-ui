import {Component} from "@angular/core";

@Component({
    selector: "app-nav",
    templateUrl: "nav.component.html",
    styleUrls: ["nav.component.scss"]
})
export class NavComponent {
    page: string | undefined = "GROUPS";

    select(page?: string) {
        this.page = page;
    }
}