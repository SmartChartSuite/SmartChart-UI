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
import {RcApiTestComponent} from "./TEMPORARY/rc-api-test-component/rc-api-test-component.component";
import {MatIcon} from "@angular/material/icon";
import {PatientsComponent} from "./components/patients/patients.component";
import {PatientFinderComponent} from "./components/patient-finder/patient-finder.component";
import {PatientSelectorComponent} from "./components/patient-selector/patient-selector.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import { SideNavComponent } from './components/side-nav/side-nav.component';


export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

export const stateFactory = (stateManagementService: StateManagementService) => {
  return () => stateManagementService.initializeState();
};

@NgModule({
  declarations: [
    AppComponent,
    PatientsComponent,
    PatientFinderComponent,
    PatientSelectorComponent,
    SideNavComponent
  ],
  imports: [
    HttpClientModule,
    OAuthModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
    BrowserAnimationsModule,
    MatIcon,
    MatTabGroup,
    MatTab,
    RcApiTestComponent // TODO: Delete
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
