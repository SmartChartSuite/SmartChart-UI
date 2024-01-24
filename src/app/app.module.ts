import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from "./components/login/login.component";
import {ConfigService} from "./services/config/config.service";
import {HttpClientModule} from "@angular/common/http";
import {StateManagementService} from "./services/state-management/state-management.service";

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
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
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
}
