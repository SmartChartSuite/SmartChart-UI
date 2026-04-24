import {provideAppInitializer, importProvidersFrom, inject} from "@angular/core";
import {provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS} from "@angular/common/http";
import {bootstrapApplication} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideRouter} from "@angular/router";
import {provideNativeDateAdapter} from "@angular/material/core";

import {ConfigService} from "./app/services/config/config.service";
import {StateManagementService} from "./app/services/state-management/state-management.service";
import {LoggingInterceptor} from "./app/services/loading/loading.interceptor";
import {OAuthModule} from "angular-oauth2-oidc";
import {routes} from "./app/app.routes";
import {AppComponent} from "./app/app.component";
import {providePrimeNG} from "primeng/config";
import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';
import Material from '@primeuix/themes/material';

// Define custom Aura preset with Angular Material Indigo colors
const IndigoAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    providePrimeNG({
      theme: {
        preset: IndigoAura,
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
