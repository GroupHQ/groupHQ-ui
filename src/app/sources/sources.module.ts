import {NgModule} from "@angular/core";
import {SourcesComponent} from "./sources.component";
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [SharedModule],
    declarations: [SourcesComponent],
    exports: [SourcesComponent]
})
export class SourcesModule {}