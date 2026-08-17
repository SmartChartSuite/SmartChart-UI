import {FhirBaseResource} from "./fhir/fhir.base.resource";

export class Results {
  [key: string]: any;
  subject: FhirBaseResource;
  status: string;
  completeJobs: number;
  totalJobs: number;

  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Get the ResultSet for a specific linkId
   * @param linkId The link identifier
   * @returns The ResultSet or null if not found
   */
  getLinkResult(linkId: string): ResultSet | null {
    if (!linkId) return null;
    const key = `link${linkId}`;
    return this[key] || null;
  }

  /**
   * Check if evidence exists for a given linkId
   * @param linkId The link identifier
   * @returns true if evidence exists and has items
   */
  hasEvidence(linkId: string): boolean {
    const result = this.getLinkResult(linkId);
    return !!(result?.evidence && result.evidence.length > 0);
  }

  /**
   * Get the count of evidence items for a given linkId
   * @param linkId The link identifier
   * @returns The number of evidence items, or 0 if none exist
   */
  getEvidenceCount(linkId: string): number {
    return this.getLinkResult(linkId)?.evidence?.length || 0;
  }
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
