import { importProvidersFrom } from "@angular/core";
import { AppComponent } from "./app/app.component";
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { AppRoutes } from "./app/app-routes";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { APP_CONFIG } from "./app/config/config";
import { provideRouter } from "@angular/router";

fetch("./config/config.json")
  .then((response) => response.json())
  .then((config) => {
    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(BrowserModule),
        { provide: APP_CONFIG, useValue: config },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(AppRoutes),
      ],
    }).catch((err) => console.error(err));
  });
