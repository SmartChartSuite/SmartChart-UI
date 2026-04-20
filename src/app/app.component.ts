import {Component, ChangeDetectorRef} from '@angular/core';
import {ConfigService} from "./services/config/config.service";
import {OAuthService} from "angular-oauth2-oidc";
import {StateManagementService} from "./services/state-management/state-management.service";
import {RouteState} from "./models/application-state";
import {LoadingService} from "./services/loading/loading.service";
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { LoadingComponent } from './components/loading/loading.component';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [SideNavComponent, LoadingComponent, RouterOutlet, LoginComponent]
})
export class AppComponent {
  title = '';
  expanded: boolean = false;
  currentRoute: RouteState | undefined; //TODO: REMOVE

  constructor(
    config: ConfigService,
    public oauthService: OAuthService,
    private applicationState: StateManagementService,
    public loadingService: LoadingService,
    private cdr: ChangeDetectorRef //TODO Refactor to use signals and remove
  ) {
    this.title = config.config.title;

    // Listen for token events to trigger change detection
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received' || event.type === 'token_refreshed') {
        this.cdr.detectChanges(); //TODO remove manual change detection
      }
    });

    this.applicationState.getState().subscribe({
      next: value => {
        this.currentRoute = value.currentRoute; // TODO: REMOVE
      }
    });
  }

  onExpandedStatusChanged(expanded: boolean) {
    this.expanded = expanded;
  }

  protected readonly RouteState = RouteState;
}
