import {Component, OnInit} from '@angular/core';
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {PatientSummary} from "../../models/patient-summary";
import {FormType} from "../../models/form-type";

@Component({
  selector: 'app-new-chart',
  templateUrl: './new-chart.component.html',
  styleUrl: './new-chart.component.scss'
})
export class NewChartComponent implements OnInit{
  selectedPatient: PatientSummary;
  selectedForm: FormType;
  constructor(private rcApiInterfaceService: RcApiInterfaceService) {
  }

  onFormSelected(event: FormType) {
    this.selectedForm = event;
  }

  onStartJob() {
    //needs patient ID and form name
    console.log(this.selectedForm);
    console.log(this.selectedPatient);
  }

  ngOnInit(): void {
    this.rcApiInterfaceService.selectedPatient$
      .subscribe(value => this.selectedPatient = value);
  }
}
