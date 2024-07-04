import { importProvidersFrom } from "@angular/core";
import { AppComponent } from "./app/app.component";
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { AppRoutes } from "./app/app-routes";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(AppRoutes),
  ],
}).catch((err) => console.error(err));
