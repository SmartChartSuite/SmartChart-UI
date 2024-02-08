export class ApplicationState {
  constructor() {
    this.currentRoute = RouteState.CONTENT_ROOT; // Default Route.
  }
  currentRoute: RouteState;
}

export enum RouteState {
  CONTENT_ROOT,
  JOBS
}
