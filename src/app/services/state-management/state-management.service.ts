import { Injectable } from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map, Observable} from "rxjs";
import {ApplicationState} from "../../models/application-state";

@Injectable({
  providedIn: 'root'
})
export class StateManagementService {

  private applicationState$: BehaviorSubject<ApplicationState>;

  private defaultState: ApplicationState = {
    currentComponent: "content-root"
  }

  constructor() {
    this.applicationState$ = new BehaviorSubject<ApplicationState>(this.defaultState);
  }

  // Initialize from the stateFactory or re-initalize in case of error.
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
