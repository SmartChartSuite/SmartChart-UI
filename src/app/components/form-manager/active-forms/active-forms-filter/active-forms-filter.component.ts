import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {FormSummary} from "../../../../models/form-summary";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-active-forms-filter',
  templateUrl: './active-forms-filter.component.html',
  styleUrl: './active-forms-filter.component.scss'
})
export class ActiveFormsFilterComponent implements OnInit{
  @Output() onFormValueChange = new EventEmitter<any>();

  readonly GENDER_LIST = ["Any", "Male", "Female", "Other", "Unknown"];
  statusList : string[] = ['Any'];
  //TODO add from api call populating the radio buttons for the form names
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
    status: new FormControl(this.statusList[0]),
  });

  formList: FormSummary[] = [];

  constructor(private rcApiInterfaceService: RcApiInterfaceService) {
    this.searchResultsForm.addControl('startedRange', this.startedRange);
    this.searchResultsForm.addControl('dobRange', this.dobRange);
  }

  ngOnInit(): void {
    this.searchResultsForm.valueChanges.pipe(debounceTime(500)).subscribe(value => {
      Object.keys(value).forEach(key => {
        if (value[key] && value[key].toString().toUpperCase() == 'ANY') {
          value[key] = null;
        }
      });
      this.onFormValueChange.emit(value);
    });

    this.rcApiInterfaceService.getSmartChartUiQuestionnaires().subscribe({
      next: value => {
        this.formList = value;
        console.log(this.formList);
      },
      error: err => {
        console.error(err);
      }
    });
  }

  onClearForm() {
    this.searchResultsForm.reset();
    this.searchResultsForm.controls['gender'].setValue(this.GENDER_LIST[0], {emitEvent: false});
    this.searchResultsForm.controls['status'].setValue(this.statusList[0], {emitEvent: false});
  }

}
