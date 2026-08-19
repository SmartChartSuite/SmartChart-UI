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

  /**
   * Populates the form group from a FHIR QuestionnaireResponse
   * Recursively processes the nested item structure and extracts answers
   * @param formGroup The reactive form group to populate
   * @param questionnaireResponse The FHIR QuestionnaireResponse
   */
  populateFormGroupFromQuestionnaireResponse(formGroup: FormGroup, questionnaireResponse: any): void {
    if (!questionnaireResponse?.item || !formGroup) {
      return;
    }

    // Recursively process items to extract answers
    const processItems = (items: any[]) => {
      items.forEach(item => {
        if (item.linkId && item.answer && item.answer.length > 0) {
          const answer = item.answer[0]; // Take first answer
          const control = formGroup.get(item.linkId);

          if (control) {
            // Map different FHIR answer types to form control values
            if (answer.valueString !== undefined) {
              control.setValue(answer.valueString, { emitEvent: false });
            } else if (answer.valueInteger !== undefined) {
              control.setValue(answer.valueInteger, { emitEvent: false });
            } else if (answer.valueDecimal !== undefined) {
              control.setValue(answer.valueDecimal, { emitEvent: false });
            } else if (answer.valueBoolean !== undefined) {
              control.setValue(answer.valueBoolean, { emitEvent: false });
            } else if (answer.valueDate !== undefined) {
              this.setDateTimeControl(formGroup, item.linkId, answer.valueDate, QuestionnaireItemType.date);
            } else if (answer.valueTime !== undefined) {
              this.setDateTimeControl(formGroup, item.linkId, answer.valueTime, QuestionnaireItemType.time);
            } else if (answer.valueDateTime !== undefined) {
              this.setDateTimeControl(formGroup, item.linkId, answer.valueDateTime, QuestionnaireItemType.dateTime);
            } else if (answer.valueCoding !== undefined) {
              const value = answer.valueCoding.display || answer.valueCoding.code;
              control.setValue(value, { emitEvent: false });
            } else if (answer.valueQuantity !== undefined) {
              // For quantity types, set both value and unit controls
              const valueControl = formGroup.get(`${item.linkId}_value`);
              const unitControl = formGroup.get(`${item.linkId}_unit`);
              if (valueControl) {
                valueControl.setValue(answer.valueQuantity.value, { emitEvent: false });
              }
              if (unitControl) {
                unitControl.setValue(answer.valueQuantity.unit || answer.valueQuantity.code, { emitEvent: false });
              }
            }
          }
        }

        // Process nested items recursively
        if (item.item && item.item.length > 0) {
          processItems(item.item);
        }
      });
    };

    processItems(questionnaireResponse.item);
  }

  /**
   * Helper method to set date/time controls from FHIR values
   */
  private setDateTimeControl(formGroup: FormGroup, linkId: string, value: string, type: QuestionnaireItemType): void {
    const dateTimeGroup = formGroup.get(`${linkId}_dateTime`) as FormGroup;
    const mainControl = formGroup.get(linkId);

    if (!dateTimeGroup) {
      // If no dateTime group exists, just set the main control
      if (mainControl) {
        mainControl.setValue(value, { emitEvent: false });
      }
      return;
    }

    const dateControl = dateTimeGroup.get('date');
    const timeControl = dateTimeGroup.get('time');

    if (type === QuestionnaireItemType.date) {
      // Parse date string (YYYY-MM-DD)
      if (dateControl) {
        dateControl.setValue(new Date(value), { emitEvent: false });
      }
    } else if (type === QuestionnaireItemType.time) {
      // Parse time string (HH:mm:ss)
      if (timeControl) {
        const timePart = value.split(':').slice(0, 2).join(':'); // Get HH:mm
        timeControl.setValue(timePart, { emitEvent: false });
      }
    } else if (type === QuestionnaireItemType.dateTime) {
      // Parse datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
      const [datePart, timePart] = value.split('T');
      if (dateControl && datePart) {
        dateControl.setValue(new Date(datePart), { emitEvent: false });
      }
      if (timeControl && timePart) {
        const time = timePart.split(':').slice(0, 2).join(':'); // Get HH:mm
        timeControl.setValue(time, { emitEvent: false });
      }
    }

    // Also set the main control for consistency
    if (mainControl) {
      mainControl.setValue(value, { emitEvent: false });
    }
  }
}
