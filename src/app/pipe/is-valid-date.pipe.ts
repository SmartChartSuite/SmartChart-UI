import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isValidDate',
  standalone: true
})
export class IsValidDatePipe implements PipeTransform {
  private dateRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
  transform(data : any): boolean {
    if(this.dateRegex.test(data) || this.isValidISODate(data)){
      console.log(`found ${data} ${this.dateRegex.test(data)} ${this.isValidISODate(data)}`)
      return true
    }
    return false;
  }

  private isValidISODate(dateString: string): boolean {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    // Validate year, month, and day
    return year >= 1000 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
  }

}
