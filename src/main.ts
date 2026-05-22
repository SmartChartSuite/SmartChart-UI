import {provideAppInitializer, importProvidersFrom, inject} from "@angular/core";
import {provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS} from "@angular/common/http";
import {bootstrapApplication} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideRouter} from "@angular/router";
import {provideNativeDateAdapter} from "@angular/material/core";

import {ConfigService} from "./app/services/config/config.service";
import {StateManagementService} from "./app/services/state-management/state-management.service";
import {LoggingInterceptor} from "./app/services/loading/loading.interceptor";
import {AuthService} from "./app/services/auth/auth.service";
import {OAuthModule} from "angular-oauth2-oidc";
import {routes} from "./app/app.routes";
import {AppComponent} from "./app/app.component";
import {providePrimeNG} from "primeng/config";
import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';
import Material from '@primeuix/themes/material';

// Define custom Aura preset with custom primary color #213368
const CustomAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e8eaf2',
      100: '#c5cade',
      200: '#9ea7c8',
      300: '#7784b2',
      400: '#5a69a1',
      500: '#3d4f91',
      600: '#374889',
      700: '#2f3f7e',
      800: '#273674',
      900: '#1a2662',
      950: '#213368'
    }
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    providePrimeNG({
      theme: {
        preset: CustomAura,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: false
        }
      }
    }),
    provideAnimations(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    importProvidersFrom(OAuthModule.forRoot()),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      const stateManagementService = inject(StateManagementService);
      const authService = inject(AuthService);

      // Load config first, then initialize state and auth in parallel
      return new Promise<void>((resolve, reject) => {
        configService.loadConfig().subscribe({
          next: () => {
            Promise.all([
              stateManagementService.initializeState(),
              authService.configure()
            ]).then(() => resolve()).catch(reject);
          },
          error: reject
        });
      });
    }),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true
    }
  ]
})
  .catch(err => console.error(err));
