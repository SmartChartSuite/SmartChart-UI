import {AuthConfig} from "angular-oauth2-oidc";
import config from "../config/config.json";

export const authCodeFlowConfig: AuthConfig = {
  issuer: config.issuer,
  redirectUri: config.callbackUrl,
  clientId: config.clientId,
  responseType: 'code',
  scope: config.scope,
  showDebugInformation: true,
  requireHttps: false,
  logoutUrl: config.logoutUrl
};
