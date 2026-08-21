import {provideAppInitializer, importProvidersFrom, inject} from "@angular/core";
import {provideHttpClient, withInterceptorsFromDi, withInterceptors, HTTP_INTERCEPTORS, withXhr} from "@angular/common/http";
import {bootstrapApplication} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideRouter} from "@angular/router";
import {provideNativeDateAdapter} from "@angular/material/core";

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
