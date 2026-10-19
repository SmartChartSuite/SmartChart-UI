import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';

type DateValue = string | number | Date | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class EvidenceHelperService {
  private readonly datePipe = new DatePipe('en-US');

  getDateAgeAsStr(dateValue: DateValue, patientDob: DateValue): string {
    if (!dateValue && patientDob) {
      return '';
    }

    return `${this.getFormattedDate(dateValue)} (${this.getAgeAt(dateValue, patientDob)})`;
  }

  getAgeAt(dateValue: DateValue, patientDob: DateValue): string {
    if (!patientDob) {
      return 'No DOB Given';
    }
    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);
    const dateOfBirth = new Date(patientDob);
    if (Number.isNaN(date.getTime()) || Number.isNaN(dateOfBirth.getTime())) {
      return '';
    }

    let years = date.getFullYear() - dateOfBirth.getFullYear();
    let months = date.getMonth() - dateOfBirth.getMonth();
    if (months < 0 || (months === 0 && date.getDate() < dateOfBirth.getDate())) {
      years--;
      months += 12;
    }

    if (years < 0) {
      return '';
    }
    if (years < 1) {
      return `${months} ${months === 1 ? 'mo' : 'mos'}`;
    }
    if (years < 2) {
      return `${months + 12} mos`;
    }
    return `${years} yrs`;
  }

  private getFormattedDate(dateValue: DateValue): string {
    return this.datePipe.transform(dateValue, 'MM/dd/yyyy') ?? '';
  }
}
