import {System} from "./system";
import {DatePipe} from "@angular/common";

export class StructuredEvidenceDTO {
  [key: string]: any;

  getCode(evidence, property: string, preferredSystems? : string[]) {
    if (!preferredSystems) return evidence?.[property]?.coding?.[0] || undefined;
    let coding = evidence?.[property]?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(evidence, property, preferredSystems.splice(1, preferredSystems.length));
    else return coding;
  }

  getDateAgeAsStr(dateStr, patientDob){
    return `${this.getFormattedDate(dateStr)} (${this.getAgeAt(new Date(dateStr), new Date(patientDob))})`
  }

  getSystemFromEnum(system: System): string  {
    if(system == System.LOINC) return "Loinc";
    else if(system == System.ICD_10) return "ICD-10";
    else if(system == System.SNOMED) return "SNOMED CT";
    else if(system == System.RX_NORM) return "RxNorm";
    else if(system == System.CPT) return "CPT";
    else if(system) return system; //Unknown systems passed. We need to render it to the user
    else return "";
  }

  private getFormattedDate(dateStr: string) {
    let datePipe = new DatePipe("en-US");
    return datePipe.transform(dateStr, 'MM/dd/yyyy');
  }

  // Function to calculate age in years
  private getAgeAt(date: Date, patientDob: Date): string {
    //const birthDate = new Date(dob);

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
      return `${months} mos`;
    }
    else if(years < 2){
      return `${months + 12} mos`
    }
    else {
      return `${years}yrs`
    }
  }

}
