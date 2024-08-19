import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-active-forms-filter',
  templateUrl: './active-forms-filter.component.html',
  styleUrl: './active-forms-filter.component.scss'
})
export class ActiveFormsFilterComponent implements AfterViewInit{
  @Output() onFormValueChange = new EventEmitter<any>();

  readonly GENDER_LIST = ["Any", "Male", "Female", "Other", "Unknown"];
  statusList : string[] = ['Any'];
  nameList: string[] = ['Any'];

  dobRange = new FormGroup({
    dobStart: new FormControl(null),
    dobEnd: new FormControl(null),
  });

  startedRange = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  searchResultsForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    gender: new FormControl(this.GENDER_LIST[0]),
    formName: new FormControl(''),
    status: new FormControl(this.GENDER_LIST[0]),
  });

  constructor() {
    this.searchResultsForm.addControl('startedRange', this.startedRange);
    this.searchResultsForm.addControl('dobRange', this.dobRange);
  }

  ngAfterViewInit(): void {
    this.searchResultsForm.valueChanges.subscribe(value => {
      this.onFormValueChange.emit(value)
    });
  }

  onClearForm() {
    this.searchResultsForm.reset();
  }
}
