import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class Results {
  [key: string]: any;
  subject: FhirBaseResource;
  status: string;
}

export class ResultSet {
  cqlAnswer?: FhirBaseResource;
  nlpAnswers?: NlpAnswer[];
  evidence?: FhirBaseResource[];
}

export class NlpAnswer {
  term: string;
  date: string;
  fullText: string; // Base64
  fragment: string;
  evidenceReferenceList: string[]
}
