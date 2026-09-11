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

/** The answers and supporting evidence found for a single question. */
export class ResultSet {
  /** The CQL answer Observation, when the question was answered by CQL. */
  cqlAnswer?: FhirBaseResource;
  /** The answer Observations produced by NLPQL for this question. */
  nlpAnswerObservations: FhirBaseResource[] = [];
  /** The de-duplicated resources referenced as evidence by the answers. */
  evidence: FhirBaseResource[] = [];
}
