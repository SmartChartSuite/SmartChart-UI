import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TIMEZONES} from "../../../assets/const/timezones";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {QuestionType} from "../../models/question-type";

@Component({
  selector: 'app-fhir-date-time',
  templateUrl: './fhir-date-time.component.html',
  styleUrl: './fhir-date-time.component.scss'
})
export class FhirDateTimeComponent implements OnChanges, OnInit {

  @Input() inputValue: string;
  @Input() questionType: QuestionType;

  protected readonly TIMEZONES = TIMEZONES;
  protected readonly QuestionType = QuestionType;

  form = new FormGroup({});
  @Output() onDateTimeUpdated = new EventEmitter<any>();
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionType'].currentValue == QuestionType.TIME){
      this.form.addControl('time', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }
    if (changes['questionType'].currentValue == QuestionType.DATE){
      this.form.addControl('date', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
    }
    if (changes['questionType'].currentValue == QuestionType.DATE_TIME){
      this.form.addControl('date', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      this.form.addControl('time', new FormControl(this.getTimeStr(this.inputValue), Validators.required));
      this.form.addControl('timezone', new FormControl(this.getTimezone(this.inputValue), Validators.required));
    }

    if (changes['questionType'].currentValue == QuestionType.DATE_TIME){
      this.updateFormValue(this.inputValue);
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
    this.form.valueChanges.subscribe(value => this.formValueToStr(value, this.questionType))
  }

  private updateFormValue(inputValue: string) {
    console.log(this.form);
    console.log(inputValue);
  }

  private formValueToStr(value: any, questionType: QuestionType) {
    console.log(value)
  }
}
