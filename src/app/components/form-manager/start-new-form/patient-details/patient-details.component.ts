import {Component, Input} from '@angular/core';
import {PatientSummary} from "../../../../models/patient-summary";

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss'
})
export class PatientDetailsComponent {
  @Input() patientSummary: PatientSummary
}
