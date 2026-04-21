import {Component, OnInit} from '@angular/core';
import { MatRadioChange, MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {FormSummary} from "../../../../models/form-summary";
import {PatientSummary} from "../../../../models/patient-summary";
import {FormManagerService} from "../../../../services/form-manager/form-manager.service";
import {UtilsService} from "../../../../services/utils/utils.service";
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
    selector: 'app-form-selection',
    templateUrl: './form-selection.component.html',
    styleUrl: './form-selection.component.scss',
  imports: [MatError, MatRadioGroup, FormsModule, MatRadioButton, MatLabel, MatFormField, MatSelect, MatOption]
})
export class FormSelectionComponent implements OnInit {
  isLoading = false;
  formList: FormSummary[];
  selectedPatient: PatientSummary;
  selectedForm: FormSummary;
  constructor(
    private rcApiInterfaceService: RcApiInterfaceService,
    private formManagerService: FormManagerService,
    private utilsService: UtilsService){}

  getFormList(){
    this.isLoading = true;
    this.rcApiInterfaceService.getQuestionTypes$.subscribe({
      next: value => {
        this.formList = value;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.utilsService.showErrorMessage();
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
  onFormSelected(event: any) {
    this.formManagerService.setSelectedForm(event.value);
  }
}
