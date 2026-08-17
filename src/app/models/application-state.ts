export class ApplicationState {
  constructor() {
    this.currentRoute = RouteState.LANDING; // Default Route.
    this.formStates = {};
  }
  currentRoute: RouteState;
  formStates: { [batchId: string]: any };
}

export enum RouteState {
  LANDING,
  FORM_MANAGER,
  CURRENT_FORM,
  JOBS_FORMS,
}
