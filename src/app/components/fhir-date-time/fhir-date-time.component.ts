import {
  Component,
  effect,
  input,
  OnInit,
  output,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import {MatTimepickerInput, MatTimepickerModule} from "@angular/material/timepicker";
import {Subject, takeUntil} from "rxjs";

const timeRegex = /([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]{1,9})?/;
const dateRegex =  /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?/;
const dateTimeRegex =  /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]{1,9})?)?)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)?)?)?/;

@Component({
  selector: 'app-fhir-date-time',
  templateUrl: './fhir-date-time.component.html',
  styleUrl: './fhir-date-time.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatHint,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatTimepickerInput,
    MatTimepickerModule
  ]
})
export class FhirDateTimeComponent implements OnInit, OnDestroy {

  inputValue = input<string>('');
  questionType = input.required<QuestionnaireItemType>();
  onDateTimeUpdated = output<{value: string; questionType: QuestionnaireItemType}>();
  onPickerOpened = output<void>();

  // protected readonly TIMEZONES = TIMEZONES;
  private destroy$ = new Subject<void>();
  protected readonly QuestionnaireItemType = QuestionnaireItemType;
  private readonly timeRegex = timeRegex;
  private readonly dateRegex = dateRegex;
  private readonly dateTimeRegex = dateTimeRegex;

  form = new FormGroup({
    date: new FormControl(null),
    time: new FormControl(null)
  });

  constructor() {
    effect(() => {
      this.updateValidators(this.questionType());
    });

    effect(() => {
      const inputValue = this.inputValue();
      const questionType = this.questionType();

      if (inputValue.trim()) {
        this.processInputValue(inputValue, questionType);
      }
    });
  }

  private updateValidators(questionType: QuestionnaireItemType): void {
    const dateControl = this.form.controls['date'];
    const timeControl = this.form.controls['time'];

    // Clear existing validators
    dateControl.clearValidators();
    timeControl.clearValidators();

    // Set validators based on question type
    if (questionType === QuestionnaireItemType.time) {
      timeControl.setValidators(Validators.required);
    } else if (questionType === QuestionnaireItemType.date) {
      dateControl.setValidators(Validators.required);
    } else if (questionType === QuestionnaireItemType.dateTime) {
      dateControl.setValidators(Validators.required);
      timeControl.setValidators(Validators.required);
    }

    dateControl.updateValueAndValidity();
    timeControl.updateValueAndValidity();
  }

  private processInputValue(inputValue: string, questionType: QuestionnaireItemType): void {
    const normalizedInputValue = inputValue.replaceAll(' ', '');

    if (!this.checkValidInput(normalizedInputValue, questionType)) {
      console.warn(`Invalid ${questionType} detected with value ${normalizedInputValue}`);
      return;
    }

    // Skip if value hasn't changed
    const currentFormValue = this.formValueToStr(this.form.value, questionType);
    if (currentFormValue === normalizedInputValue) {
      return;
    }

    // Update form based on question type
    if (questionType === QuestionnaireItemType.date) {
      const date = this.getDateFromISOString(normalizedInputValue, 'date');
      this.form.patchValue({ date }, { emitEvent: false });
    } else if (questionType === QuestionnaireItemType.dateTime) {
      const date = this.getDateFromISOString(normalizedInputValue, 'date');
      const time = this.getDateFromISOString(normalizedInputValue, 'time');
      this.form.patchValue({ date, time }, { emitEvent: false });
    } else if (questionType === QuestionnaireItemType.time) {
      // Widget accepts HH:MM format only
      const time = normalizedInputValue.length > 5
        ? normalizedInputValue.substring(0, 5)
        : normalizedInputValue;
      this.form.patchValue({ time }, { emitEvent: false });
    }
  }

  private getDateFromISOString(utcString: string, dataType: 'date' | 'time'): string | null {
    if (!utcString) return null;

    const dateObj = new Date(utcString);

    if (dataType === 'date') {
      const year = dateObj.getUTCFullYear();
      const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getUTCDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    if (dataType === 'time') {
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return null;
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const strValue = this.formValueToStr(value, this.questionType());
      // Only emit if we have a valid value to prevent clearing the form
      if (strValue) {
        this.onDateTimeUpdated.emit({value: strValue, questionType: this.questionType()})
      }
    })
  }

  private formValueToStr(value: any, questionType: QuestionnaireItemType): string {
    if (questionType === QuestionnaireItemType.date) {
      return this.formatDate(value.date);
    }

    if (questionType === QuestionnaireItemType.time) {
      return value.time ? `${value.time}:00` : '';
    }

    if (questionType === QuestionnaireItemType.dateTime) {
      return this.formatDateTime(value.date, value.time);
    }

    return '';
  }

  private formatDate(dateValue: any): string {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
  }

  private formatDateTime(dateValue: any, timeValue: string): string {
    if (!dateValue || !timeValue) return '';

    const dateObj = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';

    const datePart = dateObj.toISOString().split('T')[0];
    return `${datePart}T${timeValue}:00.000Z`;
  }

  private checkValidInput(inputValue: string, questionType: QuestionnaireItemType): boolean {
    const regexMap = {
      [QuestionnaireItemType.time]: this.timeRegex,
      [QuestionnaireItemType.date]: this.dateRegex,
      [QuestionnaireItemType.dateTime]: this.dateTimeRegex
    };

    const regex = regexMap[questionType];
    return regex ? new RegExp(regex).test(inputValue) : false;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
