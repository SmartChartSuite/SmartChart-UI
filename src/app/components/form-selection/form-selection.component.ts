import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatRadioChange} from "@angular/material/radio";
import {FormType, formTypes} from "../../models/form-type";

@Component({
  selector: 'app-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrl: './form-selection.component.scss'
})
export class FormSelectionComponent {
  @Output() formSelectedEvent = new EventEmitter<FormType>();
  @Input() selectedForm: FormType;

  formList: FormType[] = formTypes;
  onFormSelected(event: MatRadioChange) {
    this.formSelectedEvent.emit(event.value);
  }
}
