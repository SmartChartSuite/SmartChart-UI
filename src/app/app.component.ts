import {Component, ChangeDetectorRef} from '@angular/core';
import {ConfigService} from "./services/config/config.service";
import {OAuthService} from "angular-oauth2-oidc";
import {StateManagementService} from "./services/state-management/state-management.service";
import {RouteState} from "./models/application-state";
import {LoadingService} from "./services/loading/loading.service";
import {LoadingComponent} from './components/loading/loading.component';
import {RouterOutlet} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {HeaderComponent} from "./components/header/header.component";
import {ErrorMessageComponent} from "./components/error-message/error-message.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [LoadingComponent, RouterOutlet, LoginComponent, HeaderComponent, ErrorMessageComponent]
})
export class AppComponent {
  title = '';
  currentRoute: RouteState | undefined; //TODO: REMOVE

  constructor(
    config: ConfigService,
    public oauthService: OAuthService,
    private applicationState: StateManagementService,
    public loadingService: LoadingService,
  ) {
    this.title = config.config.title;

    this.applicationState.getState().subscribe({
      next: value => {
        this.currentRoute = value.currentRoute; // TODO: REMOVE
      }
    });
  }
}
