import {PatientIdentifier, PatientName} from "../patient-summary";
import {HttpParams} from "@angular/common/http";

export class PatientSearchParameters extends HttpParams {
  given?: string;
  family?: string;
  birthdate?: string;
  identifier?: string;
  _id: string;

  setNameAndBirthDate(name: PatientName, birthDate: Date) {
    if (this.identifier) throw new Error("Search Parameter can only have either name or identifier. Identifier found.");
    this.birthdate = `${birthDate.getDate()}`;
    this.given = name.given[0];
    this.family = name.family;
    // ?given=Bob&family=Smith&birthDate={birthDate}
  }

  setIdentifier(patientIdentifier: PatientIdentifier) {
    if (this.given || this.family || this.birthdate) throw new Error("Search Parameter can only have either name or identifier. Name or birth date found.");
    this.identifier = `${patientIdentifier.system}|${patientIdentifier.value}`; // "MRN|123-45A-BCD-67E"
    // ?identifier="MRN|123-45A-BCD-67E"
  }
}
