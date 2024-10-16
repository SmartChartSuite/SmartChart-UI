import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {PatientSummary} from "../../models/patient-summary";
import {FormSummary} from "../../models/form-summary";
import {ActiveFormSummary} from "../../models/active-form-summary";

@Injectable({
  providedIn: 'root'
})
export class FormManagerService {

  private formStarted = new Subject<null>();
  formStarted$ = this.formStarted.asObservable();
  setFormStarted(){
    // When a new job is started we want to restore the state of the app.
    // This includes reloading the active forms and clearing a=the selections for the forms data
    this.formStarted.next(null);
    this.selectedPatient.next(null);
    this.selectedForm.next(null);
  }


  private selectedPatient = new Subject<PatientSummary>();
  selectedPatient$ = this.selectedPatient.asObservable();
  setSelectedPatient(patientSummary: PatientSummary){
    this.selectedPatient.next(patientSummary);
  }

  private selectedForm= new Subject<FormSummary>();
  selectedForm$ = this.selectedForm.asObservable();
  setSelectedForm(formSummary: FormSummary){
    this.selectedForm.next(formSummary);
  }

  private selectedActiveFormSummary= new BehaviorSubject<ActiveFormSummary>(null);
  selectedActiveFormSummary$ = this.selectedActiveFormSummary.asObservable();
  setSelectedActiveFormSummary(activeFormSummary: ActiveFormSummary){
    this.selectedActiveFormSummary.next(activeFormSummary);
  }

  constructor() { }
}
