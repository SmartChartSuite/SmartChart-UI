import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TIMEZONES} from "../../../assets/const/timezones";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {QuestionType} from "../../models/question-type";
import {provideMomentDateAdapter} from "@angular/material-moment-adapter";

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY-MM',
    dateA11yLabel: 'MM',
    monthYearA11yLabel: 'YYYY-MM',
  },
};

@Component({
  selector: 'app-fhir-date-time',
  templateUrl: './fhir-date-time.component.html',
  styleUrl: './fhir-date-time.component.scss',
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
  ],
})
export class FhirDateTimeComponent implements OnChanges, OnInit {

  @Input() inputValue: string;
  @Input() questionType: QuestionType;
  @Output() onDateTimeUpdated = new EventEmitter<any>();

  protected readonly TIMEZONES = TIMEZONES;
  protected readonly QuestionType = QuestionType;

  form = new FormGroup({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionType']?.currentValue == QuestionType.TIME){
      this.form.addControl('time', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }
    if (changes['questionType']?.currentValue == QuestionType.DATE && !this.form.contains('date')){
      this.form.addControl('date', new FormControl(this.getDateStr(this.inputValue), Validators.required));
    }
    if (changes['questionType']?.currentValue == QuestionType.DATE_TIME){
      this.form.addControl('date', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      this.form.addControl('time', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }

    if (changes['inputValue']?.currentValue && this.questionType == QuestionType.DATE){
      if(this.questionType == QuestionType.DATE){
        const date  = new Date(this.inputValue);
        this.form.controls['date'].setValue(date, { emitEvent: false });
      }
    }
  }

  private getTimeStr(inputValue: string) {
    return "";
  }

  private getTimezone(inputValue: string) {
    const timezoneOffset = new Date().getTimezoneOffset();
    return this.TIMEZONES[3];
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(value => {
      const strValue = this.formValueToStr(value, this.questionType);
      this.onDateTimeUpdated.emit({value: strValue, questionType: QuestionType.DATE})
    })
  }

  private updateFormValue(inputValue: string) {
    console.log(this.form);
  }

  private formValueToStr(value: any, questionType: QuestionType) {
    if(this.questionType == QuestionType.DATE){
      return value?.date;
    }
  }

  private getDateStr(inputValue: string){
    if(!inputValue){
      return null;
    }
    return undefined;
  }
}
