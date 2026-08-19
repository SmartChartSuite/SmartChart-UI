import {Injectable} from '@angular/core';
import {QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer} from "../../models/fhir/resources/fhir.questionnaireresponse";
import {FormAnswers, QuantityAnswer} from "../../models/form-answers";
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {QuestionnaireResponseStatus} from "../../models/fhir/valuesets/questionnaire-response-status";
import {QuestionnaireItemType} from "../../models/fhir/valuesets/questionnaire-item-type";
import {ActiveFormSummary} from "../../models/active-form-summary";
import {Questionnaire} from "../../models/questionnaire";

@Injectable({
  providedIn: 'root'
})
export class FormOutputMappingService {

  constructor() { }

  /**
   * Maps reactive form values to a FHIR QuestionnaireResponse
   * @param formValues The reactive form values
   * @param questionnaire The Questionnaire model
   * @param activeFormSummary Optional active form summary for patient reference
   * @returns A FHIR QuestionnaireResponse
   */
  mapToFhir(formValues: any, questionnaire: Questionnaire | undefined, activeFormSummary?: ActiveFormSummary): QuestionnaireResponse {
    const qr = new QuestionnaireResponse();

    qr.status = QuestionnaireResponseStatus.inProgress;

    if (questionnaire?.['url']) {
      qr.questionnaire = questionnaire['url'];
    }

    if (activeFormSummary) {
      qr.subject = { reference: `Patient/${activeFormSummary.patientSummary.fhirId}` };
    }

    qr.item = [];

    if (!questionnaire?.item) {
      return qr;
    }

    // Process each top-level section
    questionnaire.item.forEach((section, sectionIndex) => {
      const sectionItem = new QuestionnaireResponseItem();
      sectionItem.linkId = section.linkId;
      sectionItem.item = [];

      // Process each question in the section
      if (section.item && Array.isArray(section.item)) {
        section.item.forEach(question => {
          const questionItem = this.mapQuestionToResponseItem(question, formValues);
          if (questionItem) {
            sectionItem.item!.push(questionItem);
          }
        });
      }

      qr.item.push(sectionItem);
    });

    return qr;
  }

  /**
   * Maps a single question to a QuestionnaireResponseItem
   */
  private mapQuestionToResponseItem(question: any, formValues: any): QuestionnaireResponseItem | null {
    const responseItem = new QuestionnaireResponseItem();
    responseItem.linkId = question.linkId;
    responseItem.text = question.text;

    const value = formValues[question.linkId];

    // Skip if no value provided
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const answer = new QuestionnaireResponseItemAnswer();

    switch (question.type as QuestionnaireItemType) {
      case QuestionnaireItemType.string:
      case QuestionnaireItemType.text:
        answer.valueString = value;
        break;

      case QuestionnaireItemType.integer:
        answer.valueInteger = parseInt(value, 10);
        break;

      case QuestionnaireItemType.decimal:
        answer.valueDecimal = parseFloat(value);
        break;

      case QuestionnaireItemType.boolean:
        answer.valueBoolean = value === true || value === 'true';
        break;

      case QuestionnaireItemType.date:
        answer.valueDate = value;
        break;

      case QuestionnaireItemType.time:
        answer.valueTime = value;
        break;

      case QuestionnaireItemType.dateTime:
        answer.valueDateTime = value;
        break;

      case QuestionnaireItemType.choice:
        answer.valueCoding = {
          display: value
        };
        break;

      case QuestionnaireItemType.quantity:
        const quantityValue = formValues[`${question.linkId}_value`];
        const quantityUnit = formValues[`${question.linkId}_unit`];
        if (quantityValue !== null && quantityValue !== undefined) {
          answer.valueQuantity = {
            value: parseFloat(quantityValue),
            unit: quantityUnit || ''
          };
        }
        break;

      default:
        // For unknown types, store as string
        answer.valueString = String(value);
    }

    responseItem.answer = [answer];
    return responseItem;
  }


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
