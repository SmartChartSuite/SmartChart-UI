import {Component, computed, inject, ChangeDetectionStrategy} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {ConfigService} from "../../services/config/config.service";
import {OAuthService} from "angular-oauth2-oidc";
import {NavigationEnd, Router} from "@angular/router";
import {NgClass} from "@angular/common";
import {LoginComponent} from "../login/login.component";
import {toSignal} from "@angular/core/rxjs-interop";
import {filter, map} from "rxjs/operators";
import {combineLatest} from "rxjs";
import {FormManagerService} from "../../services/form-manager/form-manager.service";
import {StateManagementService} from "../../services/state-management/state-management.service";

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatButton,
    NgClass,
    LoginComponent
  ],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  configService = inject(ConfigService);
  oauthService = inject(OAuthService);
  router = inject(Router);
  private formManagerService = inject(FormManagerService);
  private stateManagementService = inject(StateManagementService);

  private routerEvents = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly currentRoute = computed(() => this.routerEvents() ?? '');

  protected readonly hasActiveFormWithState = toSignal(
    combineLatest([
      this.formManagerService.selectedActiveFormSummary$,
      this.stateManagementService.getState()
    ]).pipe(
      map(([activeForm, appState]) => {
        if (!activeForm?.batchId || !appState?.formStates) {
          return false;
        }
        return !!appState.formStates[activeForm.batchId];
      })
    ),
    { initialValue: false }
  );

  protected onPathSelected(path: string) {
    this.router.navigate([path]);
  }

  protected onLogout() {
    this.oauthService.logOut();
  }
}
