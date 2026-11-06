import {Injectable} from '@angular/core';
import {QuestionnaireResponse, QuestionnaireResponseItem} from "../../models/fhir/resources/fhir.questionnaireresponse";
import {FormAnswers, QuantityAnswer} from "../../models/form-answers";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {QuestionnaireResponseStatus} from "../../models/fhir/valuesets/questionnaire-response-status";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import {ActiveFormSummary} from "../../models/active-form-summary";

@Injectable({
  providedIn: 'root'
})
export class FormOutputMappingService {

  constructor() { }


  /** Maps the form's answer dictionary into a FHIR QuestionnaireResponse. */
  mapQrToFhir(formAnswers: FormAnswers, questionnaire: FhirBaseResource, activeFormSummary?: ActiveFormSummary): QuestionnaireResponse {
    let qr = new QuestionnaireResponse();

    qr.status = QuestionnaireResponseStatus.inProgress; // REQUIRED FIELD
    if(Object.keys(questionnaire).includes("url")) {
      qr.questionnaire = questionnaire["url"];
    }
    if(activeFormSummary){
      qr.subject = { reference: `Patient/${activeFormSummary.patientSummary.fhirId }` }
    }

    // TODO: Handle subject, author, and source.

    qr.item = [];
    for (const [groupKey, groupItem] of Object.entries(questionnaire["item"])) {
      qr.item[groupKey] = new QuestionnaireResponseItem();
      qr.item[groupKey].linkId = groupItem["linkId"];
      qr.item[groupKey].item = []
      for (const [childKey, childItem] of Object.entries(groupItem["item"])) {
        let qrChildItem = new QuestionnaireResponseItem();
        qrChildItem.linkId = childItem["linkId"];
        qrChildItem.text = childItem["text"];
        const answerValue = formAnswers[qrChildItem.linkId];

        if (this.hasAnswer(answerValue)) {
          let answer = {}
          switch (childItem["type"]) {
            // "group" not applicable
            // "display" not applicable
            // "question" not applicable
            case QuestionnaireItemType.boolean: {
              const booleanValue = this.toBooleanAnswer(answerValue);
              if (booleanValue !== undefined) {
                answer["valueBoolean"] = booleanValue;
              }
              break;
            }
            case QuestionnaireItemType.decimal: {
              answer["valueDecimal"] = Number(answerValue)
              break;
            }
            case QuestionnaireItemType.integer: {
              answer["valueInteger"] = Number(answerValue)
              break;
            }
            case QuestionnaireItemType.date: {
              answer["valueDate"] = answerValue;
              break;
            }
            case QuestionnaireItemType.dateTime: {
              answer["valueDateTime"] = answerValue;
              break;
            }
            case QuestionnaireItemType.time: {
              answer["valueTime"] = answerValue;
              break;
            }
            case QuestionnaireItemType.string: {
              answer["valueString"] = answerValue;
              break;
            }
            case QuestionnaireItemType.text: {
              answer["valueString"] = answerValue;
              break;
            }
            case QuestionnaireItemType.url: {
              answer["valueUri"] = answerValue;
              break;
            }
            case QuestionnaireItemType.choice: {
              // Choice answers may be a FHIR Coding (code + display) or a plain
              // string, depending on whether the answerOption used valueCoding
              // or valueString. Emit the matching QuestionnaireResponse value.
              const choice = answerValue;
              if (choice && typeof choice === 'object') {
                answer["valueCoding"] = {
                  code: choice.code,
                  display: choice.display
                };
              } else if (this.hasAnswer(choice)) {
                answer["valueString"] = choice;
              }
              break;
            }
            case QuestionnaireItemType.openChoice: {
              // TODO: Implement QR Open Choice Answer Type
              break;
            }
            case QuestionnaireItemType.attachment: {
              // TODO: Implement QR Attachment Answer Type
              break;
            }
            case QuestionnaireItemType.reference: {
              // TODO: Implement QR Reference Answer Type
              break;
            }
            case QuestionnaireItemType.quantity: {
              let quantity: { value?: number, unit?: string } = this.formatValueQuantity(answerValue);
              if (Object.keys(quantity).length > 0){
                answer["valueQuantity"] = quantity;
              }
              break;
            }
          }
          if (Object.keys(answer).length > 0) {
            qrChildItem.answer = [];
            qrChildItem.answer[0] = answer;
          }
        }

        qr.item[groupKey].item[childKey] = qrChildItem;
      }
    }
    return qr;
  }

  /** Treats false and zero as answers while excluding missing or blank values. */
  private hasAnswer(value: unknown): boolean {
    return typeof value === 'string'
      ? value.trim().length > 0
      : value !== undefined && value !== null;
  }

  /** Converts supported boolean representations without treating "false" as true. */
  private toBooleanAnswer(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return undefined;
  }

  /** Serializes quantity values, including the valid numeric value zero. */
  private formatValueQuantity(quantity: QuantityAnswer): {value?: number, unit?: string} {
    let quantityFormatted: {value?: number, unit?: string} = {};
    const rawValue = quantity?.value;

    if (this.hasAnswer(rawValue)) {
      const numericValue = Number(rawValue);
      if (Number.isFinite(numericValue)) {
        quantityFormatted.value = numericValue;
      }
    }

    if (quantity?.unit) {
      quantityFormatted.unit = quantity.unit;
    }
    return quantityFormatted;
  }

}
