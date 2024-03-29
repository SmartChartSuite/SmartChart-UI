import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {FormType, formTypes} from "../../models/form-type";
import {RcApiInterfaceService} from "../../services/rc-api-interface/rc-api-interface.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrl: './form-selection.component.scss'
})
export class FormSelectionComponent implements OnInit {
  @Output() formSelectedEvent = new EventEmitter<FormType>();
  @Input() selectedForm: FormType = FormType.SCD;

  formList: FormType[] = formTypes;

  formList$: Observable<any>;

  constructor(private rcApiInterfaceService: RcApiInterfaceService){}
  ngOnInit(): void {
    this.formList$ = this.rcApiInterfaceService.searchQuestionnaire();
  }
  onFormSelected(event: MatRadioChange) {
    this.formSelectedEvent.emit(event.value);
  }
}
