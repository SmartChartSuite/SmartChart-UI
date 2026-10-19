import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {OAuthErrorEvent, OAuthService} from 'angular-oauth2-oidc';

/**
 * Centralizes handling of expired / invalid sessions.
 *
 * There are two independent ways a session can end while the user is active:
 *
 *  1. The Auth0 session (and refresh token) expires. `angular-oauth2-oidc`'s
 *     automatic silent refresh then fails against `/oauth/token` (e.g. a 403)
 *     and emits a `*_refresh_error` / `session_terminated` event. The locally
 *     cached access token may still be valid for a while, so nothing else would
 *     otherwise force the user back to login.
 *
 *  2. A resource-server request returns 401/403 because the access token itself
 *     is no longer accepted.
 *
 * Both paths funnel through {@link expireSession}, which clears the stale local
 * token and redirects to the login page (preserving the current URL so the user
 * can be returned there after re-authenticating).
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly oauthService = inject(OAuthService);
  private readonly router = inject(Router);

  /** Guards against redirecting to /login repeatedly for concurrent failures. */
  private handlingExpiry = false;

  /**
   * Subscribes to OAuth lifecycle events so that a failed silent refresh or a
   * terminated session immediately drives the user back to login. Call once
   * during app initialization (after the OAuthService has been configured).
   */
  monitorSession(): void {
    this.oauthService.events.subscribe(event => {
      const isRefreshFailure =
        event instanceof OAuthErrorEvent &&
        (event.type === 'silent_refresh_error' ||
          event.type === 'token_refresh_error');

      const isSessionEnded =
        event.type === 'session_terminated' || event.type === 'session_error';

      if (isRefreshFailure || isSessionEnded) {
        this.expireSession();
      }
    });
  }

  /**
   * Clears the stale local token and navigates to the login page. Safe to call
   * multiple times; only the first call for a given expiry takes effect.
   */
  expireSession(): void {
    if (this.handlingExpiry) {
      return;
    }
    this.handlingExpiry = true;

    // Already on the login page: nothing to do.
    if (this.router.url.startsWith('/login')) {
      this.handlingExpiry = false;
      return;
    }

    const returnUrl = this.router.url;

    // Local-only logout: remove the cached tokens so hasValidAccessToken()
    // reports false and the UI reflects a logged-out state, without a full
    // Auth0 logout round-trip (the Auth0 session is already gone).
    this.oauthService.logOut(true);

    this.router.navigate(['/login'], {
      queryParams: returnUrl && returnUrl !== '/' ? {returnUrl} : undefined
    }).finally(() => {
      this.handlingExpiry = false;
    });
  }
}
