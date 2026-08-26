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

  private routerEvents = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly currentRoute = computed(() => this.routerEvents() ?? '');

  protected onPathSelected(path: string) {
    this.router.navigate([path]);
  }

  /**
   * Starts the OAuth login flow, passing the current page URL as OAuth state so
   * the callback returns the user to where they were after signing in.
   */
  protected signIn() {
    this.oauthService.initLoginFlow(this.router.url);
  }

  protected onLogout() {
    this.oauthService.logOut();
  }
}
