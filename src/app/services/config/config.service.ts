import { Injectable } from '@angular/core';
import {catchError, map, of} from "rxjs";
import {Config} from "../../models/config";
import packageInfo from '../../../../package.json';
import {HttpBackend, HttpClient} from "@angular/common/http";
import {AuthConfig, OAuthModuleConfig} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  // Absolute, root-anchored path to the runtime config.
  //
  // The app is served from the domain root and config.json always lives at
  // /assets/config/config.json. Using a leading "/" anchors the request to
  // the site root so it is independent of the current route, the DOM
  // <base href>, and any trailing slash. A base-href-relative or "../"
  // relative path resolves against the *current route's* URL instead, so
  // refreshing a deep route like /jobs-forms shifts resolution to
  // /jobs-forms/assets/config/config.json, which 404s (or falls through to
  // index.html), stalling app init and rendering a blank page.
  defaultLocalConfigPath = '/assets/config/config.json'
  config: Config = new Config();
  authConfig: AuthConfig;
  oAuthModuleConfig: OAuthModuleConfig;
  packageInfo = packageInfo;

  private http: HttpClient;

  public apiUrl = "";

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  loadConfig() {
    console.log(this.defaultLocalConfigPath);
    return this.http.get<Config>(this.defaultLocalConfigPath).pipe(
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

  getModuleConfig(): OAuthModuleConfig {
    return this.oAuthModuleConfig;
  }
}
