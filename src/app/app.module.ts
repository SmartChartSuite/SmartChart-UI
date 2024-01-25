import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from "./components/login/login.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfigService} from "./services/config/config.service";
import {HttpClientModule} from "@angular/common/http";
import {StateManagementService} from "./services/state-management/state-management.service";
import {AuthModule} from "@auth0/auth0-angular";
import config from "../assets/config/config.json";

export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

export const stateFactory = (stateManagementService: StateManagementService) => {
  return () => stateManagementService.initializeState();
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AuthModule.forRoot({
      domain: config.domain, //'dev-dk7cyfpkwowbtdbt.us.auth0.com',
      clientId: config.clientId, //'fTlUrcK87D6tKT3dTwn3iC2xssoWJHPg',
      authorizationParams: {
        redirect_uri: config.callbackUrl // TODO: Change to dynamic handling.
      }
    }),
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
    BrowserAnimationsModule,
    HttpClientModule
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
