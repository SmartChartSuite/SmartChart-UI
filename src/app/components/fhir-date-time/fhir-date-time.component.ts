import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {QuestionType} from "../../models/question-type";
import {provideMomentDateAdapter} from "@angular/material-moment-adapter";

const timeRegex = /([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]{1,9})?/;
const dateRegex =  /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?/;

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

  // protected readonly TIMEZONES = TIMEZONES;
  protected readonly QuestionType = QuestionType;
  private readonly timeRegex = timeRegex;
  private readonly dateRegex = dateRegex;


  form = new FormGroup({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionType']?.currentValue == QuestionType.TIME){
      this.form.addControl('time', new FormControl(this.inputValue, Validators.required));
      // this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }
    if (changes['questionType']?.currentValue == QuestionType.DATE && !this.form.contains('date')){
      this.form.addControl('date', new FormControl(new Date(this.inputValue), Validators.required));
    }
    if (changes['questionType']?.currentValue == QuestionType.DATE_TIME){
      this.form.addControl('date', new FormControl(new Date(this.inputValue), Validators.required));
      this.form.addControl('time', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      // this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }

    if (changes['inputValue']?.currentValue ){
      // Check if the input value is in correct fhir format
      if(!this.checkValidInput(this.inputValue, this.questionType)){
        console.error(`Invalid ${this.questionType} detected with value ${this.inputValue}`);
        return;
      }

      if(this.questionType == QuestionType.DATE){
        const date  = new Date(this.inputValue);
        this.form.controls['date'].setValue(date, { emitEvent: false });
      }
      else if (this.questionType == QuestionType.DATE_TIME){
        // TODO update all form controls
      }
      else if(this.questionType == QuestionType.TIME){
        //The widget accepts data in format HH:MM only. If the format is HH:MM:SS, we need to truncate the SS part
        const time = this.inputValue.length > 5 ? this.inputValue.substring(0, 5) : this.inputValue;
        this.form.controls['time'].setValue(time, { emitEvent: false });
      }
    }
  }

  private getTimeStr(inputValue: string) {
    return "";
  }

  // private getTimezone(inputValue?: string) {
  //   if(!inputValue){
  //     this.TIMEZONES.find(zone => zone.value == "+00:00");
  //   }
  //   //TODO implement get timezone based on input string value
  //   return null;
  // }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(value => {
      const strValue = this.formValueToStr(value, this.questionType);
      this.onDateTimeUpdated.emit({value: strValue, questionType: this.questionType})
    })
  }

  private formValueToStr(value: any, questionType: QuestionType) {
    if(questionType == QuestionType.DATE){
      return value?.date;
    }
    else if(questionType == QuestionType.TIME){
      return `${value.time}:00`
    }
  }

  private checkValidInput(inputValue: string, questionType: QuestionType): boolean {
    if(questionType == QuestionType.TIME){
      const regExp = new RegExp(this.timeRegex);
      return regExp.test(this.inputValue);
    }
    if(questionType == QuestionType.DATE){
      const regExp = new RegExp(this.dateRegex);
      return regExp.test(this.inputValue);
    }
    else return false;
  }
}
