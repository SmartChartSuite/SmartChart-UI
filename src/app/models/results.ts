import {FhirBaseResource} from "./fhir/fhir.base.resource";

/**
 * The results of a batch job: the job-level status fields plus one
 * {@link ResultSet} per answered question, keyed as `link{linkId}`.
 */
export class Results {
  [key: string]: any;
  subject: FhirBaseResource;
  status: string;
  completeJobs: number;
  totalJobs: number;
}

/** A direct answer Observation value with optional coding metadata. */
export interface SimpleAnswer {
  display: string;
  system?: string;
  code?: string;
  codingDisplay?: string;
}

/** The answers and supporting evidence found for a single question. */
export class ResultSet {
  /** The CQL answer Observation, when the question was answered by CQL. */
  cqlAnswer?: FhirBaseResource;
  /** Direct value[x] answers that do not reference a focused evidence resource. */
  simpleAnswers: SimpleAnswer[] = [];
  /** The answer Observations produced by NLPQL for this question. */
  nlpAnswerObservations: FhirBaseResource[] = [];
  /** The de-duplicated resources referenced as evidence by the answers. */
  evidence: FhirBaseResource[] = [];
}
