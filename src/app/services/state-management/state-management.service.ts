import { Injectable } from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map, Observable} from "rxjs";
import {ApplicationState, RouteState} from "../../models/application-state";

@Injectable({
  providedIn: 'root'
})
export class StateManagementService {

  private applicationState$: BehaviorSubject<ApplicationState>;

  private defaultState: ApplicationState = {
    currentRoute: RouteState.LANDING,
    formStates: {}
  }

  constructor() {
    this.applicationState$ = new BehaviorSubject<ApplicationState>(this.defaultState);
  }

  // Initialize from the stateFactory or re-initialize in case of error.
  initializeState() {
    const sessionState = this.readFromSession();
    if (sessionState) {
      this.applicationState$.next(sessionState);
    }
    else {
      this.applicationState$.next(this.defaultState);
    }
  }

  getState(): Observable<ApplicationState> {
    return this.applicationState$.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  // Update State
  setState(newState: Partial<ApplicationState>) {
    this.applicationState$.next({
      ...this.applicationState$.value,
      ...newState,
    })
    this.writeToSession(this.applicationState$.value);
  }

  /**
   * Helper function to streamline just updating the current route for callback URL.
   * @param route RouteState
   */
  setCurrentRoute(route: RouteState) {
    this.setState({currentRoute: route});
  }

  /**
   * Save form state to session storage
   * @param batchId Unique identifier for the form
   * @param formValues Form values to save
   */
  saveFormState(batchId: string, formValues: any): void {
    const currentState = this.applicationState$.value;
    const updatedFormStates = {
      ...currentState.formStates,
      [batchId]: formValues
    };
    this.setState({ formStates: updatedFormStates });
  }

  /**
   * Retrieve saved form state from session storage
   * @param batchId Unique identifier for the form
   * @returns Saved form values or null if not found
   */
  getFormState(batchId: string): any | null {
    const formStates = this.applicationState$.value.formStates;
    return formStates?.[batchId] || null;
  }

  /**
   * Clear saved form state from session storage
   * @param batchId Unique identifier for the form
   */
  clearFormState(batchId: string): void {
    const currentState = this.applicationState$.value;
    const updatedFormStates = { ...currentState.formStates };
    delete updatedFormStates[batchId];
    this.setState({ formStates: updatedFormStates });
  }

  writeToSession(state: ApplicationState) {
    sessionStorage.setItem("applicationState", JSON.stringify(state));
  }

  readFromSession(): ApplicationState {
    const applicationState = sessionStorage.getItem("applicationState");
    if (applicationState === null) {
      return this.defaultState;
    }
    else {
      return JSON.parse(applicationState) as ApplicationState;
    }
  }
}
