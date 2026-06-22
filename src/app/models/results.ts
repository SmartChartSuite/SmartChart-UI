import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class Results {
  [key: string]: any;
  subject: FhirBaseResource;
  status: string;
  completeJobs: number;
  totalJobs: number;
}

export class ResultSet {
  cqlAnswer?: FhirBaseResource;
  nlpAnswers?: NlpAnswer[];
  evidence?: FhirBaseResource[];
}

export class AnswerComponent{
  label: string;
  value: string;
}

export class NlpAnswer {
  term: string;
  date: string;
  fullText: string; // Base64
  sectionText: string;
  textFragment: string;
  noteText: string;
  fragment: string;
  evidenceReferenceList: string[];
  documentReferenceResource: any;
  observationResource: any;
  type: string;
  observationDisplay: string;
  componentAnswerList: AnswerComponent[];
  llmPrompt: string;
  llmAnswer: string;
  evidenceText: string;
  reasoning: string;
  resultValue: string
}
