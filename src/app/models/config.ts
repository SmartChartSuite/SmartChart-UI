export class Config {
  // Constructor used to create a blank config for observable output only.
  constructor() {}

  version: string = "";
  title: string = "";
  rcApiUrl: string = "";
  auth: AuthConfig;
}

export class AuthConfig {
  domain: string = "";
  clientId: string = "";
  scope: string = "openid email profile";
  showDebugInformation: boolean = true;
  responseType: string = "code";
  logoutUrl: string = "";
  callbackUrl: string = "";
  customQueryParams: CustomQueryParameters = {};
  issuer: string = "";
  requireHttps: boolean = true;
}

export class CustomQueryParameters {
  audience?: string = "";
}
