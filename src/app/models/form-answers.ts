import {FhirBaseResource} from "./fhir/fhir.base.resource";
import {QuestionnaireItemType} from "./fhir/valuesets/questionnaire-item-type";
export class QuantityAnswer{
  value: string;
  unit: string;
}
export class FormAnswers {
  [key: string]: any;
  constructor(questionnaire: FhirBaseResource) {
    const items = questionnaire?.['item'] ?? [];
    items.forEach(outerItem => {
      outerItem.item?.forEach(innerItem => {
        if(innerItem.type== QuestionnaireItemType.quantity){
          this[`${innerItem.linkId}`] = new QuantityAnswer();
        }
        else {
          this[`${innerItem.linkId}`] = '';
        }
      });
    });
  }
}
