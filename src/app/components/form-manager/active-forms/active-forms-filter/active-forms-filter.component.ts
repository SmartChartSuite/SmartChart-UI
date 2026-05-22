import {Component, effect, EventEmitter, input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormSummary} from "../../../../models/form-summary";
import {RcApiInterfaceService} from "../../../../services/rc-api-interface/rc-api-interface.service";
import {debounceTime} from "rxjs";
import {MatButton} from '@angular/material/button';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {MultiSelectModule} from 'primeng/multiselect';
import {DatePickerModule} from 'primeng/datepicker';

@Component({
  selector: 'app-active-forms-filter',
  templateUrl: './active-forms-filter.component.html',
  styleUrl: './active-forms-filter.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButton,
    FloatLabelModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule
  ]
})
export class ActiveFormsFilterComponent implements OnInit {
  @Output() onFormValueChange = new EventEmitter<any>();
  isLoading = input<boolean>(true);

  readonly GENDER_LIST = ["Any", "Male", "Female", "Other", "Unknown"];
  statusList: string[] = ['Any'];
  //TODO add from api call populating the radio buttons for the form names
  nameList: string[] = ['Any'];

  searchResultsForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    gender: new FormControl([this.GENDER_LIST[0]]),
    dobRange: new FormControl(null),
    formName: new FormControl(''),
    startedRange: new FormControl(null),
    status: new FormControl(this.statusList[0]),
  });

  formList: FormSummary[] = [];

  constructor(private rcApiInterfaceService: RcApiInterfaceService) {
    this.searchResultsForm.disable();

    // Use effect to enable/disable form based on isLoading signal
    effect(() => {
      if (!this.isLoading()) {
        this.searchResultsForm.enable();
      }
    });
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
    this.searchResultsForm.controls['gender'].setValue([this.GENDER_LIST[0]], {emitEvent: false});
    this.searchResultsForm.controls['status'].setValue(this.statusList[0], {emitEvent: false});
    this.searchResultsForm.controls['formName'].setValue(this.formList[0], {emitEvent: false});
  }

}
