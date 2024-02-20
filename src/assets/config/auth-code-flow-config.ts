import {AuthConfig} from "angular-oauth2-oidc";
import config from "../config/config.json";

export const authCodeFlowConfig: AuthConfig = {
  issuer: config.auth.issuer,
  redirectUri: window.location.origin,
  clientId: config.auth.clientId,
  responseType: config.auth.responseType,
  scope: config.auth.scope,
  showDebugInformation: config.auth.showDebugInformation,
  requireHttps: config.auth.requireHttps,
  logoutUrl: config.auth.logoutUrl,
  customQueryParams: config.auth.customQueryParams
};
