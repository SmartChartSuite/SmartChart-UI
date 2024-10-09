import {Injectable} from '@angular/core';
import {QuestionnaireResponse, QuestionnaireResponseItem} from "../../models/fhir/resources/fhir.questionnaireresponse";
import {FormAnswers, QuantityAnswer} from "../../models/form-answers";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {QuestionnaireResponseStatus} from "../../models/fhir/valuesets/questionnaire-response-status";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";

@Injectable({
  providedIn: 'root'
})
export class FormOutputMappingService {

  constructor() { }


  mapToFhir(formAnswers: FormAnswers, questionnaire: FhirBaseResource): QuestionnaireResponse {
    let qr = new QuestionnaireResponse();

    qr.status = QuestionnaireResponseStatus.inProgress; // REQUIRED FIELD
    if(Object.keys(questionnaire).includes("url")) {
      qr.questionnaire = questionnaire["url"];
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

        if (formAnswers[qrChildItem.linkId]) {
          let answer = {}
          switch (childItem["type"]) {
            // "group" not applicable
            // "display" not applicable
            // "question" not applicable
            case QuestionnaireItemType.boolean: {
              // TODO: Implement QR Boolean Answer Type
              break;
            }
            case QuestionnaireItemType.decimal: {
              answer["valueDecimal"] = Number(formAnswers[qrChildItem.linkId])
              break;
            }
            case QuestionnaireItemType.integer: {
              answer["valueInteger"] = Number(formAnswers[qrChildItem.linkId])
              break;
            }
            case QuestionnaireItemType.date: {
              answer["valueDate"] = formAnswers[qrChildItem.linkId];
              break;
            }
            case QuestionnaireItemType.dateTime: {
              answer["valueDateTime"] = formAnswers[qrChildItem.linkId];
              break;
            }
            case QuestionnaireItemType.time: {
              answer["valueTime"] = formAnswers[qrChildItem.linkId];
              break;
            }
            case QuestionnaireItemType.string: {
              answer["valueString"] = formAnswers[qrChildItem.linkId];
              break;
            }
            case QuestionnaireItemType.text: {
              answer["valueString"] = formAnswers[qrChildItem.linkId];
              break;
            }
            case QuestionnaireItemType.url: {
              answer["valueUri"] = formAnswers[qrChildItem.linkId];
              break;
            }
            case QuestionnaireItemType.choice: {
              // Note: Handling in R4 is unclear, looking forward to R5 type "string" is assumed for this system.
              answer["valueString"] = formAnswers[qrChildItem.linkId];
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
              let quantity: { value?: number, unit?: string } = this.formatValueQuantity(formAnswers[qrChildItem.linkId]);
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

    console.info(qr);
    return qr;
  }

  private formatValueQuantity(quantity: QuantityAnswer): {value?: number, unit?: string} {
    let quantityFormatted: {value?: number, unit?: string} = {};
    if (quantity.value) {
      quantityFormatted.value = Number(quantity.value);
    }
    if (quantity.unit) {
      quantityFormatted.unit = quantity.unit;
    }
    return quantityFormatted;
  }

}
