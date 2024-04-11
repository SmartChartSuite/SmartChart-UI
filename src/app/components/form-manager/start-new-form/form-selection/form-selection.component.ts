import {Component, OnInit} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {Observable} from "rxjs";
import {FormSummary} from "../../../../models/form-summary";
import {PatientSummary} from "../../../../models/patient-summary";
import {FormManagerService} from "../../../../services/form-manager/form-manager.service";

@Component({
  selector: 'app-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrl: './form-selection.component.scss'
})
export class FormSelectionComponent implements OnInit {
  formList: FormSummary[];
  selectedPatient$: Observable<PatientSummary>;
  selectedForm: FormSummary;

  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService){}
  ngOnInit(): void {

    this.rcApiInterfaceService.getSmartChartUiQuestionnaires().subscribe({
      next: value => {
        this.formList = value;
        if(this.formList.length == 1){
          this.selectedForm = this.formList[0];
          this.formManagerService.setSelectedForm(this.formList[0]);
        }
      },
      error: err => console.error(err)
    });

    this.selectedPatient$ = this.formManagerService.selectedPatient$;

    this.formManagerService.selectedForm$.subscribe(value=> {
      this.selectedForm = value;
    });

  }
  onFormSelected(event: MatRadioChange) {
    this.formManagerService.setSelectedForm(event.value);
  }
}
