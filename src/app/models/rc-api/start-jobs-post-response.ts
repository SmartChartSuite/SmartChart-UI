import {Parameter, Parameters} from "../fhir/fhir.parameters.resource";

/**
 *
 */
export class StartJobsPostResponse extends Parameters {}

export enum StartJobsPostResponseKeys {
  JOB_ID = "jobId",
  JOB_START_DATE_TIME = "jobStartDateTime",
  JOB_STATUS = "jobStatus",
  RESULT = "result"
}

/**
 * EXAMPLE
 * {
 *     "resourceType": "Parameters",
 *     "parameter": [
 *         {
 *             "name": "jobId",
 *             "valueString": "f305e3c0-88e6-4733-a661-ecf4d3066a46"
 *         },
 *         {
 *             "name": "jobStartDateTime",
 *             "valueDateTime": "2024-02-09T17:31:09Z"
 *         },
 *         {
 *             "name": "jobStatus",
 *             "valueString": "inProgress"
 *         },
 *         {
 *             "name": "result",
 *             "resource": {
 *                 "resourceType": "Bundle"
 *             }
 *         }
 *     ]
 * }
 */
