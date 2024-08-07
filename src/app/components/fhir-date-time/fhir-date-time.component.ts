import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {QuestionType} from "../../models/question-type";
import {provideMomentDateAdapter} from "@angular/material-moment-adapter";

const timeRegex = /([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]{1,9})?/;
const dateRegex =  /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?/;
const dateTimeRegex =  /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]{1,9})?)?)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)?)?)?/;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const DATE_FORMATS = {
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
    provideMomentDateAdapter(DATE_FORMATS),
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
  private readonly dateTimeRegex = dateTimeRegex;


  form = new FormGroup({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionType']?.currentValue == QuestionType.TIME){
      this.form.addControl('time', new FormControl(this.inputValue, Validators.required));
    }
    if (changes['questionType']?.currentValue == QuestionType.DATE && !this.form.contains('date')){
      this.form.addControl('date', new FormControl(new Date(this.inputValue), Validators.required));
    }
    if (changes['questionType']?.currentValue == QuestionType.DATE_TIME){
      this.form.addControl('date', new FormControl(this.getDateFromUtcString(this.inputValue, 'date'), Validators.required));
      this.form.addControl('time', new FormControl(this.getDateFromUtcString(this.inputValue, 'time'), Validators.required));
      // this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }

    if (changes['inputValue']?.currentValue ){
      // Check if the input value is in correct fhir format
      if(!this.checkValidInput(this.inputValue, this.questionType)){
        console.error(`Invalid ${this.questionType} detected with value ${this.inputValue}`);
        return;
      }

      if(this.questionType == QuestionType.DATE){
        const date = this.getDateFromUtcString(this.inputValue, 'date');
        this.form.controls['date'].setValue(date, { emitEvent: false });
      }
      else if (this.questionType == QuestionType.DATE_TIME){
        const date = this.getDateFromUtcString(this.inputValue, 'date');
        this.form.controls['date'].setValue(date, { emitEvent: false });

        const time = this.getDateFromUtcString(this.inputValue, 'time')
        this.form.controls['time'].setValue(time, { emitEvent: false });
      }
      else if(this.questionType == QuestionType.TIME){
        //The widget accepts data in format HH:MM only. If the format is HH:MM:SS, we need to truncate the SS part
        const time = this.inputValue.length > 5 ? this.inputValue.substring(0, 5) : this.inputValue;
        this.form.controls['time'].setValue(time, { emitEvent: false });
      }
    }
  }

  getDateFromUtcString(utcString, dataType: 'date' | 'time') {
    if (!utcString || utcString.length == 0) {
      return null;
    }
    const dateObj = new Date(utcString);
    if (dataType == 'date') {
      const year = dateObj.getUTCFullYear();
      const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getUTCDate().toString().padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      return date;
    }

    // Extract time components
    else if (dataType) {
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return time;
    } else return null;

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
      return value?.date.toUTCString();
    }
    else if(questionType == QuestionType.TIME){
      return `${value.time}:00`
    }
    else if(questionType == QuestionType.DATE_TIME){
      //TODO verify the assumption that the user is required to enter a date and time (and not only date), and change the if statement accordingly
      if(this.form.controls['date'].value && this.form.controls['time'].value){
        const date = this.form.controls['date'].value;
        // We need to remove the time and from the ISO string, we add the time selected by the user with the time widget.
        const utcDateStr = new Date(date).toISOString().split('T')[0];
        // We append the time here. This assumes that the user is required to add both: time and date
        const time = `${this.form.controls['time'].value}:00.000Z`;
        return `${utcDateStr}T${time}`
      }
    }
  }

  private checkValidInput(inputValue: string, questionType: QuestionType): boolean {
    if(questionType == QuestionType.TIME){
      const regExp = new RegExp(this.timeRegex);
      return regExp.test(inputValue);
    }
    if(questionType == QuestionType.DATE){
      const regExp = new RegExp(this.dateRegex);
      return regExp.test(inputValue);
    }
    if(questionType == QuestionType.DATE_TIME){
      const regExp = new RegExp(this.dateTimeRegex);
      return regExp.test(inputValue);
    }
    else return false;
  }
}
