import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {PatientSummary} from "../../models/patient-summary";
import {FormSummary} from "../../models/form-summary";

@Component({
  selector: 'app-new-chart',
  templateUrl: './new-chart.component.html',
  styleUrl: './new-chart.component.scss'
})
export class NewChartComponent implements OnInit{
  selectedPatient: PatientSummary;
  selectedForm: FormSummary;
  constructor(private rcApiInterfaceService: RcApiInterfaceService) {
  }

  onStartJob() {
    //needs patient ID and form name
    console.log(this.selectedForm);
    console.log(this.selectedPatient);
  }

  ngOnInit(): void {
    this.rcApiInterfaceService.selectedPatient$
      .subscribe(value => this.selectedPatient = value);

    this.rcApiInterfaceService.selectedForm$
      .subscribe(value => this.selectedForm = value);
  }
}
