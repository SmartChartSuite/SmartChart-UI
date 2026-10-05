import {
  Component,
  effect,
  input,
  OnInit,
  output,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import {MatTimepickerInput, MatTimepickerModule} from "@angular/material/timepicker";
import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS
} from '@angular/material/core';
import {Subject, takeUntil} from "rxjs";

/**
 * FHIR `date` lexical format.
 *
 * Permitted precisions are year (`YYYY`), year/month (`YYYY-MM`), and complete
 * date (`YYYY-MM-DD`). The expression validates the lexical shape only; the
 * Material control conversion below additionally rejects calendar-invalid
 * dates such as February 31.
 */
const dateValueRegex = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/;

/**
 * FHIR `dateTime` lexical format.
 *
 * FHIR permits partial dates, but this component uses only the complete
 * date-time branch for QuestionnaireItemType.dateTime. When time is present,
 * seconds and a timezone are required. The timezone may be `Z` or a numeric
 * offset in the range permitted by FHIR. Leap-second `60` and arbitrary
 * fractional-second precision are accepted by the FHIR syntax.
 */
const dateTimeValueRegex = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?$/;

/**
 * FHIR `time` lexical format.
 *
 * A time always contains hours, minutes, and seconds, has no date component,
 * and must not contain a timezone. FHIR permits leap-second `60` and optional
 * fractional seconds. The widget does not expose seconds, so the control
 * conversion ignores that precision and the serializer always emits zero-
 * filled seconds (`00`).
 */
const timeValueRegex = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]:(?:[0-5][0-9]|60)(?:\.\d+)?$/;

/**
 * Full calendar date accepted by Angular Material's datepicker control.
 *
 * This is intentionally narrower than the FHIR `date` regex because a
 * Material datepicker requires a concrete `Date`; it cannot display a year or
 * year/month value without inventing missing calendar components.
 */
const fullDateControlRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Material display formats for the US date order and a 24-hour clock. */
const US_24_HOUR_DATE_FORMATS = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: {year: 'numeric', month: '2-digit', day: '2-digit'},
    timeInput: {hour: '2-digit', minute: '2-digit', hour12: false},
    timeOptionLabel: {hour: '2-digit', minute: '2-digit', hour12: false}
  }
};

@Component({
  selector: 'app-fhir-date-time',
  templateUrl: './fhir-date-time.component.html',
  styleUrl: './fhir-date-time.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-US'},
    {provide: MAT_DATE_FORMATS, useValue: US_24_HOUR_DATE_FORMATS}
  ],
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

  form = new FormGroup({
    date: new FormControl(null),
    time: new FormControl(null)
  });

  constructor() {
    effect(() => {
      const inputValue = this.inputValue();
      const questionType = this.questionType();

      if (inputValue.trim()) {
        this.processInputValue(inputValue, questionType);
      }
    });
  }

  /**
   * Validates and loads a value received from the FHIR answer dictionary.
   *
   * The dictionary stores FHIR strings, while Angular Material date/time
   * controls require `Date` instances. This method performs that boundary
   * conversion without emitting a value-change event, so loading an answer
   * does not overwrite the parent dictionary as though the user edited it.
   *
   * @param inputValue FHIR date, dateTime, or time string to load.
   * @param questionType Questionnaire primitive that determines the parser.
   */
  private processInputValue(inputValue: string, questionType: QuestionnaireItemType): void {
    const normalizedInputValue = inputValue.replaceAll(' ', '');

    if (!this.checkValidInput(normalizedInputValue, questionType)) {
      console.warn(`Invalid ${questionType} detected with value ${normalizedInputValue}`);
      return;
    }

    /** Avoid reparsing the same answer on repeated input-signal evaluations. */
    const currentFormValue = this.formValueToStr(this.form.value, questionType);
    if (currentFormValue === normalizedInputValue) {
      return;
    }

    /** Patch only the control(s) represented by the selected questionnaire type. */
    if (questionType === QuestionnaireItemType.date) {
      const date = this.createDateControlValue(normalizedInputValue);
      this.form.patchValue({ date }, { emitEvent: false });
    } else if (questionType === QuestionnaireItemType.dateTime) {
      const dateTimeParts = this.parseDateTimeInput(normalizedInputValue);

      if (!dateTimeParts) {
        return;
      }

      this.form.patchValue(dateTimeParts, { emitEvent: false });
    } else if (questionType === QuestionnaireItemType.time) {
      const time = this.createTimeControlValue(normalizedInputValue);
      this.form.patchValue({ time }, { emitEvent: false });
    }

  }

  /**
   * Converts a complete FHIR dateTime value into values suitable for the two
   * Material controls used by this reusable component. Date-only and time-only
   * values are handled only by their respective `date` and `time` question
   * types.
   *
   * @param inputValue Validated or candidate FHIR lexical value.
   * @returns Control values, or `null` when the value cannot be represented by
   *   the Material controls without changing its meaning.
   */
  private parseDateTimeInput(
    inputValue: string
  ): { date: Date; time: Date } | null {
    if (inputValue.includes('T') && dateTimeValueRegex.test(inputValue)) {
      /**
       * The official FHIR regex has nested capture groups. Split the already
       * validated value instead of depending on unstable capture indexes for
       * the date and time portions.
       */
      const [dateValue, timeWithTimezone] = inputValue.split('T');
      const timeValue = timeWithTimezone.replace(/(?:Z|[+-]\d{2}:\d{2})$/, '');
      const date = this.createDateControlValue(dateValue);
      const time = this.createTimeControlValue(timeValue);

      if (!date || !time) {
        return null;
      }

      return {date, time};
    }

    return null;
  }

  /**
   * Converts a complete `YYYY-MM-DD` value to the local `Date` required by
   * `MatDatepickerInput`.
   *
   * A local date is used deliberately: parsing an ISO date with `new Date()`
   * treats it as UTC, which can display the previous calendar day in a
   * negative-offset timezone. The round-trip comparison rejects dates that
   * JavaScript would otherwise normalize, such as `2026-02-31`.
   *
   * @param value Complete FHIR date value.
   * @returns A valid local date control value, or `null` for partial/invalid
   *   dates that this Material control cannot represent.
   */
  private createDateControlValue(value: string): Date | null {
    const match = fullDateControlRegex.exec(value);
    if (!match) return null;

    /** Construct locally so the calendar date is not shifted by timezone conversion. */
    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );

    /** Reject JavaScript's normalized result for calendar-invalid input. */
    return date.getFullYear() === Number(match[1]) &&
      date.getMonth() === Number(match[2]) - 1 &&
      date.getDate() === Number(match[3])
      ? date
      : null;
  }

  /**
   * Converts a canonical FHIR time into the `Date` expected by
   * `MatTimepickerInput`.
   *
   * The date portion is a fixed, local-only anchor. It is required by the
   * Material control but is never serialized. Seconds are intentionally
   * ignored and always normalized to `00` for the FHIR output.
   *
   * @param value FHIR `HH:mm:ss` value without a timezone.
   * @returns A timepicker control value, or `null` when the input is not a
   *   valid FHIR time string.
   */
  private createTimeControlValue(value: string): Date | null {
    if (!timeValueRegex.test(value)) return null;

    const [hoursValue, minutesValue] = value.split(':');
    const hours = Number(hoursValue);
    const minutes = Number(minutesValue);

    /** The calendar date is a UI-only anchor and is never sent to the API. */
    return new Date(1970, 0, 1, hours, minutes, 0);
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const strValue = this.formValueToStr(value, this.questionType());
      /**
       * Empty values are intentional: they tell the parent to remove an
       * existing answer when the user clears a date or time control.
       */
      this.onDateTimeUpdated.emit({value: strValue, questionType: this.questionType()});
    })
  }

  /**
   * Serializes the Material control state back to the FHIR string emitted to
   * the parent answer dictionary.
   *
   * A dateTime question produces a value only when both controls are
   * populated. Standalone time values are serialized by the `time` question
   * type and never by the dateTime branch.
   */
  private formValueToStr(
    value: Partial<{ date: unknown; time: unknown }>,
    questionType: QuestionnaireItemType
  ): string {
    if (questionType === QuestionnaireItemType.date) {
      return this.formatDate(value.date);
    }

    if (questionType === QuestionnaireItemType.time) {
      return this.formatTime(value.time);
    }

    if (questionType === QuestionnaireItemType.dateTime) {
      return this.formatDateTime(value.date, value.time);
    }

    return '';
  }

  /**
   * Formats a date control using local calendar parts.
   *
   * Using `toISOString().split('T')[0]` here would convert a local midnight to
   * UTC first and can therefore shift the calendar date for some users.
   */
  private formatDate(dateValue: unknown): string {
    if (!dateValue) return '';

    if (typeof dateValue === 'string' && dateValueRegex.test(dateValue)) {
      return dateValue;
    }

    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
      return '';
    }

    const year = dateValue.getFullYear().toString().padStart(4, '0');
    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
    const day = dateValue.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Emits a complete canonical representation only when both controls exist.
   *
   * A partially completed dateTime returns an empty string rather than
   * producing a date-only or time-only value. This prevents a dateTime answer
   * from being serialized as the wrong FHIR primitive.
   */
  private formatDateTime(dateValue: unknown, timeValue: unknown): string {
    const datePart = this.formatDate(dateValue);
    const timePart = this.formatTime(timeValue);

    if (datePart && timePart) {
      return `${datePart}T${timePart}.000Z`;
    }

    return '';
  }

  /**
   * Converts a Material timepicker value to the timezone-free FHIR `time`
   * format.
   *
   * Material supplies a local `Date`; only its clock fields are used. This
   * prevents the internal anchor date and local timezone from leaking into the
   * serialized FHIR value.
   */
  private formatTime(timeValue: unknown): string {
    if (timeValue instanceof Date) {
      if (Number.isNaN(timeValue.getTime())) {
        return '';
      }

      const hours = timeValue.getHours().toString().padStart(2, '0');
      const minutes = timeValue.getMinutes().toString().padStart(2, '0');
      // The UI captures hours and minutes; FHIR requires seconds, so pad 00.
      return `${hours}:${minutes}:00`;
    }

    if (typeof timeValue === 'string' && timeValueRegex.test(timeValue)) {
      /** Canonicalize an already validated string to FHIR's required seconds precision. */
      return `${timeValue.substring(0, 5)}:00`;
    }

    return '';
  }

  /**
   * Applies both FHIR lexical validation and the representational limits of
   * the Material controls used by this component.
   *
   * FHIR permits partial dates and leap seconds, but those values cannot be
   * loaded into JavaScript `Date` controls without inventing or changing data.
   */
  private checkValidInput(inputValue: string, questionType: QuestionnaireItemType): boolean {
    if (questionType === QuestionnaireItemType.dateTime) {
      return this.parseDateTimeInput(inputValue) !== null;
    }

    if (questionType === QuestionnaireItemType.time) {
      return timeValueRegex.test(inputValue) && this.createTimeControlValue(inputValue) !== null;
    }

    if (questionType === QuestionnaireItemType.date) {
      return dateValueRegex.test(inputValue) &&
        this.createDateControlValue(inputValue) !== null;
    }

    return false;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
