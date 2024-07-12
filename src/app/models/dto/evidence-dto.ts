import {DatePipe} from "@angular/common";

export class EvidenceDTO {
  public static getDateAgeAsStr(dateStr, patientDob){
    return `${this.getFormattedDate(dateStr)} (${this.getAgeAt(new Date(dateStr), new Date(patientDob))})`
  }
  private static getFormattedDate(dateStr: string) {
    let datePipe = new DatePipe("en-US");
    return datePipe.transform(dateStr, 'MM/dd/yyyy');
  }

  // Function to calculate age in years
  private static getAgeAt(date: Date, patientDob: Date): string {
    // Calculate age in years
    let years = date.getFullYear() - patientDob.getFullYear();

    // Calculate months considering birthday not yet passed
    let months = date.getMonth() - patientDob.getMonth();
    if (months < 0 || (months === 0 && date.getDate() < patientDob.getDate())) {
      years--;
      months += 12;
    }

    if(years < 0){
      return '';
    }
    else if(years < 1){
      return `${months} ${months == 1 ? 'mo' : 'mos'}`;
    }
    else if(years < 2){
      return `${months + 12} mos`
    }
    else {
      return `${years} yrs`
    }
  }
}
