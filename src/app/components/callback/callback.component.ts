import {Component, OnInit, ChangeDetectionStrategy, inject} from '@angular/core';
import {Router} from "@angular/router";
import {OAuthService} from "angular-oauth2-oidc";

@Component({
    selector: 'app-callback',
    templateUrl: './callback.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './callback.component.scss',
})
export class CallbackComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly oauthService = inject(OAuthService);

  ngOnInit(): void {
    // The OAuth service has already processed the callback during app
    // initialization via AuthService.configure(). If the user was redirected to
    // login from a protected page, that page's URL was passed as OAuth state, so
    // return them there. Otherwise fall back to the home page.
    const returnUrl = this.oauthService.state
      ? decodeURIComponent(this.oauthService.state)
      : '';
    this.router.navigateByUrl(returnUrl || "/");
  }
}
