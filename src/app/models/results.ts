import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class Results {
  [key: string]: any;
  subject: FhirBaseResource;
  status: string;
}

export class ResultSet {
  cqlAnswer?: FhirBaseResource;
  nlpAnswer?: FhirBaseResource
  evidence?: FhirBaseResource[];
}
