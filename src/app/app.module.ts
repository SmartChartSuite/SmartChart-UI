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
import {RcApiTestComponent} from "./components/TEMPORARY/rc-api-test-component/rc-api-test-component.component";
import {MatIcon} from "@angular/material/icon";
import {FormsComponent} from "./components/forms/forms.component";
import {PatientSearchComponent} from "./components/patient-search/patient-search.component";
import {PatientGroupsComponent} from "./components/patient-groups/patient-groups.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import { SideNavComponent } from './components/side-nav/side-nav.component';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import { ActiveChartsComponent } from './components/active-charts/active-charts.component';
import { NewChartComponent } from './components/new-chart/new-chart.component';
import { FormSelectionComponent } from './components/form-selection/form-selection.component';
import { PatientSummaryTableComponent } from './components/patient-summary-table/patient-summary-table.component';
import {MatButton} from "@angular/material/button";


export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

export const stateFactory = (stateManagementService: StateManagementService) => {
  return () => stateManagementService.initializeState();
};

@NgModule({
  declarations: [
    AppComponent,
    FormsComponent,
    PatientSearchComponent,
    PatientGroupsComponent,
    SideNavComponent,
    ActiveChartsComponent,
    NewChartComponent,
    FormSelectionComponent,
    PatientSummaryTableComponent,
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
    RcApiTestComponent,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
    // TODO: Delete
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
