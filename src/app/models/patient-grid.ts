import {FormStatusValue} from "./form-status";

export type JobStatusValue = 'complete' | 'running';

export interface PatientGrid {
  questionnaireResponseStatus: FormStatusValue;
  patientName: string;
  patientDob: string;
  patientGender: "male" | "female" | "unknown" | "other";
  batchJobStatus: JobStatusValue;
  jobStartDateTime: string;
  [key: string]: any;
}
