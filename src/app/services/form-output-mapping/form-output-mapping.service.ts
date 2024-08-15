import {Injectable} from '@angular/core';
import {QuestionnaireResponse, QuestionnaireResponseItem} from "../../models/fhir/resources/fhir.questionnaireresponse";
import {FormAnswers} from "../../models/form-answers";
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

    qr.item = [];
    for (const [groupKey, groupItem] of Object.entries(questionnaire["item"])) {
      //console.log(key, groupItem)
      qr.item[groupKey] = new QuestionnaireResponseItem();
      qr.item[groupKey].linkId = groupItem["linkId"];
      qr.item[groupKey].item = []
      for (const [childKey, childItem] of Object.entries(groupItem["item"])) {
        let qrChildItem = new QuestionnaireResponseItem();
        qrChildItem.linkId = childItem["linkId"];
        qrChildItem.text = childItem["text"];

        if (formAnswers[qrChildItem.linkId]) {
          let answer = {}
          // TODO: Handle "coding"
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
              // TODO: Implement QR Choice Answer Type
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
              // TODO: Implement QR Quantity Answer Type
              break;
            }
          }
          qrChildItem.answer = [];
          qrChildItem.answer[0] = answer;
        }

        qr.item[groupKey].item[childKey] = qrChildItem;
      }
    }

    console.log(qr);
    return qr;
  }

}
