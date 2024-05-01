import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class FormSummary {
  constructor(questionnaireResource: FhirBaseResource) {
    this.title = questionnaireResource['title'];
    this.name = questionnaireResource['name'];
  }
  title: string;
  name: string;
}
