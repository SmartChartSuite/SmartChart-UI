import { Injectable } from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map, Observable} from "rxjs";
import {ApplicationState, RouteState} from "../../models/application-state";

@Injectable({
  providedIn: 'root'
})
export class StateManagementService {

  private applicationState$: BehaviorSubject<ApplicationState>;

  private defaultState: ApplicationState = {
    currentRoute: RouteState.LANDING
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

  // /**
  //  * Save form state to session storage for a specific batch
  //  * @param batchId The batch ID to save state for
  //  * @param formValue The form values to save
  //  */
  // saveFormState(batchId: string, formValue: any): void {
  //   const key = `formState_${batchId}`;
  //   sessionStorage.setItem(key, JSON.stringify(formValue));
  // }
  //
  // /**
  //  * Get saved form state from session storage for a specific batch
  //  * @param batchId The batch ID to retrieve state for
  //  * @returns The saved form state or null if not found
  //  */
  // getFormState(batchId: string): any | null {
  //   const key = `formState_${batchId}`;
  //   const savedState = sessionStorage.getItem(key);
  //   return savedState ? JSON.parse(savedState) : null;
  // }
  //
  // /**
  //  * Clear saved form state from session storage for a specific batch
  //  * @param batchId The batch ID to clear state for
  //  */
  // clearFormState(batchId: string): void {
  //   const key = `formState_${batchId}`;
  //   sessionStorage.removeItem(key);
  // }
}
