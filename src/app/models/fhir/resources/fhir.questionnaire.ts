import {FhirBaseResource} from "../fhir.base.resource";
import {Coding} from "../types/coding";

export interface AnswerOption {
  valueCoding?: Coding;

  [key: string]: any;
}

export interface Item {
  linkId: string;           // Required FHIR property
  type?: string;            // QuestionnaireItemType
  text?: string;            // Question text
  value?: unknown;          // Custom property
  item?: Item[];            // Nested items
  answer?: unknown;         // Answer value
  selected?: boolean;       // Custom property for UI state
  answerOption?: AnswerOption[];
  extension?: unknown[];    // FHIR extensions

  [key: string]: unknown;   // Allow additional dynamic properties
}

export interface Questionnaire extends FhirBaseResource {
  title?: string;
  item: Item[];
}
