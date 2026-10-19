import { Pipe, PipeTransform } from '@angular/core';
import { FormStatusValue, FORM_STATUS_OPTIONS } from '../models/form-status';

@Pipe({
  name: 'formStatusDisplay'
})
export class FormStatusDisplayPipe implements PipeTransform {
  transform(value: FormStatusValue | null | undefined): string {
    if (!value) return '';
    return FORM_STATUS_OPTIONS.find(opt => opt.value === value)?.display ?? value;
  }
}
