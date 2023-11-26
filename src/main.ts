import { importProvidersFrom } from "@angular/core";
import { AppComponent } from "./app/app.component";
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { AppRoutes } from "./app/app-routes";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { RetryForeverConstantService } from "./app/services/retry/retryForeverConstant.service";
import { RetryDefaultService } from "./app/services/retry/retryDefault.service";
import { RETRY_DEFAULT, RETRY_FOREVER } from "./app/app-tokens";
import { APP_CONFIG } from "./app/config/config";
import { provideRouter } from "@angular/router";

fetch("./config/config.json")
  .then((response) => response.json())
  .then((config) => {
    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(BrowserModule),
        { provide: APP_CONFIG, useValue: config },
        { provide: RETRY_DEFAULT, useClass: RetryDefaultService },
        { provide: RETRY_FOREVER, useClass: RetryForeverConstantService },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(AppRoutes),
      ],
    }).catch((err) => console.error(err));
  });
