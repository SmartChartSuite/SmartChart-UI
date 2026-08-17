import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Questionnaire } from '../../models/questionnaire';
import { QuestionnaireItemType } from '../../models/fhir/valuesets/questionnaire-item-type';

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  buildFormGroupFromQuestionnaire(questionnaire: Questionnaire | null): FormGroup {
    const formGroup = new FormGroup({});

    if (!questionnaire?.item?.length) {
      return formGroup;
    }

    questionnaire.item.forEach(outerItem => {
      if (!outerItem.item?.length) {
        return;
      }

      outerItem.item.forEach(innerItem => {
        this.addControlForQuestionnaireItem(formGroup, innerItem);
      });
    });

    return formGroup;
  }

  private addControlForQuestionnaireItem(formGroup: FormGroup, item: any): void {
    const itemType = item.type as QuestionnaireItemType;

    switch (itemType) {
      case QuestionnaireItemType.quantity:
        // Quantity type needs two controls: value and unit
        formGroup.addControl(`${item.linkId}_value`, new FormControl(''));
        formGroup.addControl(`${item.linkId}_unit`, new FormControl(''));
        break;

      case QuestionnaireItemType.date:
      case QuestionnaireItemType.time:
      case QuestionnaireItemType.dateTime:
        // Date/time types use a nested FormGroup with date and time controls
        this.addDateTimeFormGroup(formGroup, item.linkId, itemType);
        break;

      case QuestionnaireItemType.integer:
        // Integer type needs truncation on value changes
        this.addIntegerControl(formGroup, item.linkId);
        break;

      case QuestionnaireItemType.choice:
      case QuestionnaireItemType.string:
      case QuestionnaireItemType.text:
      case QuestionnaireItemType.decimal:
        // All other types use a single control
        formGroup.addControl(item.linkId, new FormControl(''));
        break;

      default:
        console.warn(`Unsupported questionnaire item type: ${itemType}`);
        formGroup.addControl(item.linkId, new FormControl(''));
    }
  }

  private addIntegerControl(formGroup: FormGroup, linkId: string): void {
    const control = new FormControl<number | null>(null);
    formGroup.addControl(linkId, control);

    // Subscribe to value changes and automatically truncate to integer
    control.valueChanges.subscribe(value => {
      if (value != null && typeof value === 'number' && !Number.isInteger(value)) {
        control.setValue(Math.trunc(value), { emitEvent: false });
      }
    });
  }

  private addDateTimeFormGroup(parentFormGroup: FormGroup, linkId: string, questionType: QuestionnaireItemType): void {
    const dateTimeFormGroup = new FormGroup({
      date: new FormControl(null),
      time: new FormControl(null)
    });

    // Set validators based on question type
    const dateControl = dateTimeFormGroup.get('date');
    const timeControl = dateTimeFormGroup.get('time');

    if (questionType === QuestionnaireItemType.time) {
      timeControl?.setValidators(Validators.required);
    } else if (questionType === QuestionnaireItemType.date) {
      dateControl?.setValidators(Validators.required);
    } else if (questionType === QuestionnaireItemType.dateTime) {
      dateControl?.setValidators(Validators.required);
      timeControl?.setValidators(Validators.required);
    }

    // Add a hidden control that will hold the final FHIR-formatted value
    parentFormGroup.addControl(linkId, new FormControl(''));

    // Add the nested form group for UI
    parentFormGroup.addControl(`${linkId}_dateTime`, dateTimeFormGroup);

    // Subscribe to changes and update the main control
    dateTimeFormGroup.valueChanges.subscribe(value => {
      const strValue = this.formValueToStr(value, questionType);
      if (strValue) {
        parentFormGroup.get(linkId)?.setValue(strValue, { emitEvent: false });
      }
    });
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

  /**
   * Populate form group with saved values
   * @param formGroup The form group to populate
   * @param savedValues The saved form values
   */
  populateFormGroup(formGroup: FormGroup, savedValues: any): void {
    if (!savedValues || !formGroup) return;

    Object.keys(savedValues).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.setValue(savedValues[key], { emitEvent: false });
      }
    });
  }
}
