import {QuestionnaireResponseStatus} from './fhir/valuesets/questionnaire-response-status';

export interface FormDetails {
  batchId: string;
  questionnaireTitle?: string;
  questionnaireName?: string;
  questionnaireStatus?: string;
  questionnaireVersion?: string;
  questionnaireDescription?: string;
  responseStatus?: QuestionnaireResponseStatus;
  responseLastUpdated?: string;
  responseLastModifiedBy?: string;
  responseAnsweredCount: number;
  responseQuestionCount: number;
  responseCompletionPercent: number;
  patientName?: string;
  patientBirthDate?: string;
  patientGender?: string;
  patientIdentifierLabel?: string;
  patientIdentifierValue?: string;
}
