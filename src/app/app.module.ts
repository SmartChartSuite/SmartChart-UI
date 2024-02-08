import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from "./components/login/login.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfigService} from "./services/config/config.service";
import {HttpClientModule} from "@angular/common/http";
import {StateManagementService} from "./services/state-management/state-management.service";
import {OAuthModule} from "angular-oauth2-oidc";
import {MatIcon} from "@angular/material/icon";
import {PatientExplorerComponent} from "./components/patient-explorer/patient-explorer.component";
import {PatientFinderComponent} from "./components/patient-finder/patient-finder.component";
import {PatientSelectorComponent} from "./components/patient-selector/patient-selector.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";


export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

export const stateFactory = (stateManagementService: StateManagementService) => {
  return () => stateManagementService.initializeState();
};

@NgModule({
  declarations: [
    AppComponent,
    PatientExplorerComponent,
    PatientFinderComponent,
    PatientSelectorComponent
  ],
  imports: [
    HttpClientModule,
    OAuthModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIcon,
    MatTabGroup,
    MatTab,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: stateFactory,
      deps: [StateManagementService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public configService: ConfigService) {
  }
}
