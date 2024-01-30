import {AuthConfig} from "angular-oauth2-oidc";
import config from "../config/config.json";

export const authCodeFlowConfig: AuthConfig = {
  issuer: `https://${config.domain}/`,
  redirectUri: "https://localhost:4200/callback",
  clientId: config.clientId,
  responseType: 'code',
  scope: "openid email profile",
  showDebugInformation: true,
  requireHttps: false,
  logoutUrl: `${config.domain}/v2/logout`
};
