import { Injectable, inject } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import {catchError, map, of} from "rxjs";
import {Config} from "../../models/config";
import packageInfo from '../../../../package.json';
import {HttpBackend, HttpClient} from "@angular/common/http";
import {AuthConfig, OAuthModuleConfig} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  // Path to the runtime config, relative to the app's base href.
  // NOTE: this must NOT start with "../" or "/". A "../"-relative path is
  // resolved against the *current route's* URL, so refreshing a deep route
  // like /smartchart/forms/ (with a trailing slash) shifts the resolution and
  // 404s the config, which stalls app init and renders a blank page.
  defaultLocalConfigPath = 'assets/config/config.json'
  config: Config = new Config();
  authConfig: AuthConfig;
  oAuthModuleConfig: OAuthModuleConfig;
  packageInfo = packageInfo;

  private http: HttpClient;
  private platformLocation = inject(PlatformLocation);

  public apiUrl = "";

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  loadConfig() {
    const configPath = this.resolveFromBaseHref(this.defaultLocalConfigPath);
    return this.http.get<Config>(configPath).pipe(
      map((config: Config) => {
        config.version = "v" + this.packageInfo.version;
        config.rcApiUrl = this.standardizeUrl(config.rcApiUrl);
        this.config = config;
        this.authConfig = this.buildAuthConfig(config);
        this.oAuthModuleConfig = this.buildOAuthModuleConfig(config);
        return true;
      }),
      catchError(error => {
        console.error(error);
        this.config = new Config();
        return of(false);
      })
    )
  }

  buildAuthConfig(config: Config): AuthConfig {
    return new AuthConfig({
      issuer: config.auth.issuer,
      redirectUri: config.auth.callbackUrl,
      clientId: config.auth.clientId,
      responseType: 'code',
      scope: config.auth.scope,
      showDebugInformation: true,
      requireHttps: false,
      logoutUrl: config.auth.logoutUrl
    });
  }

  buildOAuthModuleConfig(config: Config): OAuthModuleConfig {
    return {
      resourceServer: {
        allowedUrls: [config.rcApiUrl],
        sendAccessToken: true
      }
    };
  }

  standardizeUrl(url: string): string {
    if (!url.endsWith("/")) {
      url = url.concat("/");
    }
    return url;
  }

  /**
   * Resolve a path against the app's base href so it does not depend on the
   * current route's URL. This makes runtime fetches (e.g. config.json) work
   * consistently whether the app is served at "/" or a subpath like
   * "/smartchart/", and regardless of any trailing slash on the route.
   */
  private resolveFromBaseHref(path: string): string {
    const baseHref = this.platformLocation.getBaseHrefFromDOM() || '/';
    const base = baseHref.endsWith('/') ? baseHref : baseHref + '/';
    return base + path.replace(/^\.*\/*/, '');
  }

  getModuleConfig(): OAuthModuleConfig {
    return this.oAuthModuleConfig;
  }
}
