
/**
 * Note: This is *NOT* intended to be representative of the FHIR Patient resource or complex Types. It is an internal to
 * the application data model summarizing the relevant patient information for both display and job management. Some data
 * structures may be roughly equivalent but simplified.
 */

export class PatientSummary {
  fhirId: string;
  name?: PatientName; // Get from FHIR Official
  birthDate?: Date;
  gender?: string;
  identifier?: PatientIdentifier[];
}

export class PatientName {
  use?: string;
  family?: string;
  given?: string[];
}

export class PatientIdentifier {
  system: string;
  value: string;
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
