export class ApplicationState {
  constructor() {
    this.currentRoute = RouteState.LANDING; // Default Route.
  }
  currentRoute: RouteState;
}

export enum RouteState {
  LANDING,
  FORM_MANAGER,
  CURRENT_FORM,
}
