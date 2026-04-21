import { provideAppInitializer, importProvidersFrom, inject } from "@angular/core";
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { provideNativeDateAdapter } from "@angular/material/core";

import { ConfigService } from "./app/services/config/config.service";
import { StateManagementService } from "./app/services/state-management/state-management.service";
import { LoggingInterceptor } from "./app/services/loading/loading.interceptor";
import { OAuthModule } from "angular-oauth2-oidc";
import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
    providers: [
        provideAnimations(),
        provideRouter(routes),
        provideNativeDateAdapter(),
        importProvidersFrom(OAuthModule.forRoot()),
        provideAppInitializer(() => {
            const configService = inject(ConfigService);
            return configService.loadConfig();
        }),
        provideAppInitializer(() => {
            const stateManagementService = inject(StateManagementService);
            return stateManagementService.initializeState();
        }),
        provideHttpClient(withInterceptorsFromDi()),
        {
            provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true
        }
    ]
})
  .catch(err => console.error(err));
