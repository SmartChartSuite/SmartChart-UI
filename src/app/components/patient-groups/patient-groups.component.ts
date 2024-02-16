import { Component } from '@angular/core';
import {PatientSummary} from "../../models/patient-summary";

@Component({
  selector: 'app-patient-groups',
  templateUrl: './patient-groups.component.html',
  styleUrl: './patient-groups.component.scss'
})
export class PatientGroupsComponent {
  selectedPatient: PatientSummary | null;

  onPatientSelected(patient: PatientSummary) {
    this.selectedPatient = patient;
  }
}
