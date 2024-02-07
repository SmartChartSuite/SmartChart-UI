export class Config {
  // Constructor used to create a blank config for observable output only.
  constructor() {}

  version: string = "";
  title: string = "";
  rcApiUrl: string = "";
  issuer: string = "";
  clientId: string = "";
  callbackUrl: string = "";
  logoutUrl: string = "";
  scope: string = "";
}
