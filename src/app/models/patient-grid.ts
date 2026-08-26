import {ValueDisplay} from "./value-display";

export type JobStatusValue = 'complete' | 'running' | 'pending';

// Type alias for form status options using the generic ValueDisplay interface
export type StatusOption = ValueDisplay<JobStatusValue>;

// Single source of truth - the array
export const JOB_STATUS_OPTIONS: readonly StatusOption[] = [
  { display: 'Preview', value: 'complete' },
  { display: 'Running', value: 'running' },
  { display: 'Pending', value: 'pending' },
] as const;

// Derive constants from STATUS_OPTIONS for type-safe comparisons
export const FormStatus = {
  COMPLETE: JOB_STATUS_OPTIONS[0].value,
  RUNNING: JOB_STATUS_OPTIONS[1].value,
  PENDING: JOB_STATUS_OPTIONS[2].value,
} as const;

export interface PatientGrid {
  questionnaireResponseStatus: JobStatusValue;
  patientName: string;
  patientDob: string;
  batchId: string;
  patientGender: "male" | "female" | "unknown" | "other";
  batchJobStatus: JobStatusValue;
  jobStartDateTime: string;
  patientId: string;
  jobPackage: string;
  questionnaireResponseId?: string;
  [key: string]: any;
}
