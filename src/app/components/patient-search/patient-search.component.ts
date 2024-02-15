import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent {

  // User fills out either identifier ** OR ** name/birthdate. These are mutually exclusive.
  // Form gives query parameters. See src/app/models/rc-api/patient-search-parameters.ts.

}
