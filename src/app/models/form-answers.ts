import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class FormAnswers {
  [key: string]: any;

  constructor(questionnaire: FhirBaseResource) {
    const items = questionnaire?.['item'] ?? [];
    items.forEach(outerItem => {
      outerItem.item?.forEach(innerItem => {
        this[`linkId${innerItem.linkId}`] = '';
      });
    });
  }
}
