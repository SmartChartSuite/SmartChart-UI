import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {FormSummary} from "../../../../models/form-summary";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-active-forms-filter',
  templateUrl: './active-forms-filter.component.html',
  styleUrl: './active-forms-filter.component.scss'
})
export class ActiveFormsFilterComponent implements OnInit, OnChanges{
  @Output() onFormValueChange = new EventEmitter<any>();
  @Input() isLoading = true;

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
    this.searchResultsForm.disable();
  }

  ngOnInit(): void {
    this.searchResultsForm.valueChanges.pipe(debounceTime(250)).subscribe(value => {
      this.onFormValueChange.emit(value);
    });
    this.rcApiInterfaceService.getQuestionTypes$.subscribe({
        next: value => {
          this.formList = JSON.parse(JSON.stringify(value));
          this.formList.unshift({name: "Any", title: "Any"});
          this.searchResultsForm.controls['formName'].setValue(this.formList[0], {emitEvent: false});
        },
        error: err => {
          console.error(err);
        }
    })
  }
  onClearForm() {
    this.searchResultsForm.reset();
    this.searchResultsForm.controls['gender'].setValue(this.GENDER_LIST[0], {emitEvent: false});
    this.searchResultsForm.controls['status'].setValue(this.statusList[0], {emitEvent: false});
    this.searchResultsForm.controls['formName'].setValue(this.formList[0], {emitEvent: false});
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    if(!this.isLoading){
      this.searchResultsForm.enable();
    }
  }

}
