import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {PatientSummary} from "../../models/patient-summary";
import {FormSummary} from "../../models/form-summary";

@Injectable({
  providedIn: 'root'
})
export class FormManagerService {

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

  constructor() { }
}
