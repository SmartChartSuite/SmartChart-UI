import {Questionnaire} from "./questionnaire";
import {QuestionnaireItemType} from "./fhir/valuesets/questionnaire-item-type";

export class QuantityAnswer{
  value: string;
  unit: string;
}

export class FormAnswers {
  [key: string]: any;

  constructor(questionnaire: Questionnaire) {
    const items = questionnaire?.item ?? [];
    items.forEach(outerItem => {
      outerItem.item?.forEach(innerItem => {
        if(innerItem.type == QuestionnaireItemType.quantity){
          this[`${innerItem.linkId}`] = new QuantityAnswer();
        }
        else {
          this[`${innerItem.linkId}`] = '';
        }
      });
    });
  }

  /**
   * Get answer value for a given linkId
   * @param linkId The linkId of the question item
   * @returns The answer value
   */
  get(linkId: string): any {
    return this[linkId];
  }

  /**
   * Set answer value for a given linkId
   * @param linkId The linkId of the question item
   * @param value The answer value to set
   */
  set(linkId: string, value: any): void {
    this[linkId] = value;
  }
}
