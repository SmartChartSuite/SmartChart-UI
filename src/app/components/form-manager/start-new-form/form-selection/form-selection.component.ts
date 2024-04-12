import {Component, OnInit} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {FormSummary} from "../../../../models/form-summary";
import {PatientSummary} from "../../../../models/patient-summary";
import {FormManagerService} from "../../../../services/form-manager/form-manager.service";

@Component({
  selector: 'app-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrl: './form-selection.component.scss'
})
export class FormSelectionComponent implements OnInit {
  isLoading = false;
  formList: FormSummary[];
  selectedPatient: PatientSummary;
  selectedForm: FormSummary;
  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService){}

  getFormList(){
    this.isLoading = true;
    this.rcApiInterfaceService.getSmartChartUiQuestionnaires().subscribe({
      next: value => {
        this.formList = value;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  ngOnInit(): void {
    this.getFormList();

    this.formManagerService.selectedPatient$.subscribe(value=>
      this.selectedPatient = value);

    this.formManagerService.selectedForm$.subscribe(value=>
      this.selectedForm = value
    );

  }
  onFormSelected(event: MatRadioChange) {
    this.formManagerService.setSelectedForm(event.value);
  }
}
