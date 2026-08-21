import {provideAppInitializer, importProvidersFrom, inject} from "@angular/core";
import {provideHttpClient, withInterceptorsFromDi, withInterceptors, HTTP_INTERCEPTORS, withXhr} from "@angular/common/http";
import {bootstrapApplication} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideRouter} from "@angular/router";
import {provideNativeDateAdapter} from "@angular/material/core";
import {APP_BASE_HREF} from "@angular/common";

import {ConfigService} from "./app/services/config/config.service";
import {StateManagementService} from "./app/services/state-management/state-management.service";
import {LoggingInterceptor} from "./app/services/loading/loading.interceptor";
import {httpErrorInterceptor} from "./app/interceptors/http-error.interceptor";
import {AuthService} from "./app/services/auth/auth.service";
import {OAuthModule, DefaultOAuthInterceptor, OAuthModuleConfig} from "angular-oauth2-oidc";
import {routes} from "./app/app.routes";
import {AppComponent} from "./app/app.component";


bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    // Force a deterministic base href of "/". The deployed index.html can end
    // up with an empty <base href> (the Docker build runs
    // `ng build --base-href $BASE_HREF` with BASE_HREF unset), which makes
    // Angular's Location normalize deep routes with a trailing slash on
    // refresh (e.g. /jobs-forms -> /jobs-forms/). Pinning APP_BASE_HREF avoids
    // depending on the DOM <base href> value.
    {provide: APP_BASE_HREF, useValue: '/'},
    importProvidersFrom(OAuthModule.forRoot()),
    {
      provide: OAuthModuleConfig,
      useFactory: (configService: ConfigService) => configService.oAuthModuleConfig,
      deps: [ConfigService]
    },
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      const stateManagementService = inject(StateManagementService);
      const authService = inject(AuthService);

      // Load config first, then initialize state and auth in parallel
      return new Promise<void>((resolve, reject) => {
        configService.loadConfig().subscribe({
          next: (loaded) => {
            if (!loaded) {
              reject(new Error(
                'Failed to load runtime configuration (assets/config/config.json). ' +
                'Verify the file is deployed and served at the app base href.'
              ));
              return;
            }
            Promise.all([
              stateManagementService.initializeState(),
              authService.configure()
            ]).then(() => resolve()).catch(reject);
          },
          error: reject
        });
      });
    }),
    provideHttpClient(withXhr(),
      withInterceptors([httpErrorInterceptor]),
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS, useClass: DefaultOAuthInterceptor, multi: true
    },
    {
      provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true
    }
  ]
})
  .catch(err => console.error(err));
