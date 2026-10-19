/**
 * Note: This is *NOT* intended to be representative of the FHIR Patient resource or complex Types. It is an internal to
 * the application data model summarizing the relevant patient information for both display and job management. Some data
 * structures may be roughly equivalent but simplified.
 */
import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class PatientSummary {
  constructor(patientResource: FhirBaseResource) {
    this.fhirId = patientResource.id; // REQUIRED
    this.birthDate = patientResource?.["birthDate"];
    this.gender = patientResource?.["gender"];
    this.name = new PatientName(patientResource?.["name"]);
    if (patientResource["identifier"]) {
      this.identifier = patientResource["identifier"];
    }
  }
  fhirId: string;
  name?: PatientName; // Get from FHIR Official
  birthDate?: Date;
  gender?: string;
  identifier?: PatientIdentifier[];
  primaryIdentifier?: PatientIdentifier;
  mrn?: string;
}

export class PatientName {
  constructor(humanNameList: any) {
    // Expects a list of FHIR Human Names. Official is prioritized, otherwise uses first in list.
    let patientName = humanNameList.find((humanName: any) => humanName["use"] === HumanNameUse.official) ?? humanNameList[0]
    this.use = patientName?.["use"];
    this.family = patientName?.["family"];
    this.given = patientName?.["given"]?.[0];
  }
  use?: string;
  family?: string;
  given?: string[];
}

export class PatientIdentifier {
  system: string;
  value: string;
}

export enum HumanNameUse {
  usual = "usual",
  official = "official",
  temp = "temp",
  nickname = "nickname",
  anonymous = "anonymous",
  old = "old",
  maiden = "maiden"
}

export const examplePatient: PatientSummary = {
  fhirId: "1234",
  name: {
      given: ["Bob"],
      family: "Smith"
    },
  birthDate: new Date(),
  identifier: [{
    system: "MRN",
    value: "123-45A-BCD-67E"
  }]
}
