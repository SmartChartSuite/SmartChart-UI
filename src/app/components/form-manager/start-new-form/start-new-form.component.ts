import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../../services/rc-api-interface/rc-api-interface.service";
import {PatientSummary} from "../../../models/patient-summary";
import {FormSummary} from "../../../models/form-summary";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";

@Component({
  selector: 'app-start-new-form',
  templateUrl: './start-new-form.component.html',
  styleUrl: './start-new-form.component.scss'
})
export class StartNewFormComponent implements OnInit{
  selectedPatient: PatientSummary;
  selectedForm: FormSummary;
  constructor(private formManagerService: FormManagerService) {
  }

  onStartJob() {
    //needs patient ID and form name
    console.log(this.selectedForm);
    console.log(this.selectedPatient);
  }

  ngOnInit(): void {
    this.formManagerService.selectedPatient$
      .subscribe(value => this.selectedPatient = value);

    this.formManagerService.selectedForm$
      .subscribe(value => this.selectedForm = value);
  }
}
