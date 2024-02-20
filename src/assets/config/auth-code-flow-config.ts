import {AuthConfig} from "angular-oauth2-oidc";
import config from "../config/config.json";

export const authCodeFlowConfig: AuthConfig = {
  issuer: config.auth.issuer,
  redirectUri: config.callbackUrl,
  clientId: config.auth.clientId,
  responseType: 'code',
  scope: config.auth.scope,
  showDebugInformation: true,
  requireHttps: false,
  logoutUrl: config.auth.logoutUrl
};
