import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {Observable} from "rxjs";
import {FormSummary} from "../../models/form-summary";
import {PatientSummary} from "../../models/patient-summary";

@Component({
  selector: 'app-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrl: './form-selection.component.scss'
})
export class FormSelectionComponent implements OnInit {
  @Output() formSelectedEvent = new EventEmitter<FormSummary>();
  @Input() selectedForm: FormSummary;

  formList: FormSummary[];

  formList$: Observable<FormSummary[]>;
  selectedPatient$: Observable<PatientSummary>;

  constructor(private rcApiInterfaceService: RcApiInterfaceService){}
  ngOnInit(): void {
    this.rcApiInterfaceService.getSmartChartUiQuestionnaires().subscribe({
      next: value => {
        this.formList = value;
        if(this.formList.length == 1){
          this.selectedForm = this.formList[0];
        }
      },
      error: err => console.error(err)
    });
    this.selectedPatient$ = this.rcApiInterfaceService.selectedPatient$;

  }
  onFormSelected(event: MatRadioChange) {
    this.formSelectedEvent.emit(event.value);
  }
}
