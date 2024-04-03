import {FhirBaseResource} from "./rc-api/fhir.base.resource";

export class FormSummary {
  constructor(questionnaireResource: FhirBaseResource) {
    this.title = questionnaireResource['title'];
    this.name = questionnaireResource['name'];
  }
  title: string;
  name: string;
}
