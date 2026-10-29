import {FormStatusValue} from "./form-status";
import {ValueDisplay} from "./value-display";

export type JobStatusValue = 'complete' | 'running' | 'pending' | 'partial' | 'error';

// Type alias for form status options using the generic ValueDisplay interface
export type StatusOption = ValueDisplay<JobStatusValue>;

// Single source of truth - the array
export const JOB_STATUS_OPTIONS: readonly StatusOption[] = [
  { display: 'Complete', value: 'complete' },
  { display: 'Running', value: 'running' },
  { display: 'Pending', value: 'pending' },
  { display: 'Partial', value: 'partial' },
  { display: 'Error', value: 'error' },
] as const;

// Derive constants from STATUS_OPTIONS for type-safe comparisons
export const FormStatus = {
  COMPLETE: JOB_STATUS_OPTIONS.find(option => option.value === 'complete')!.value,
  RUNNING: JOB_STATUS_OPTIONS.find(option => option.value === 'running')!.value,
  PENDING: JOB_STATUS_OPTIONS.find(option => option.value === 'pending')!.value,
  PARTIAL: JOB_STATUS_OPTIONS.find(option => option.value === 'partial')!.value,
  ERROR: JOB_STATUS_OPTIONS.find(option => option.value === 'error')!.value,
} as const;

export interface PatientGrid {
  // Form status (distinct from the job status in `batchJobStatus`)
  questionnaireResponseStatus: FormStatusValue;
  patientName: string;
  patientDob: string;
  batchId: string;
  patientGender: "male" | "female" | "unknown" | "other";
  batchJobStatus: JobStatusValue;
  jobStartDateTime: string;
  patientId: string;
  jobPackage: string;
  jobPackageTitle: string;
  questionnaireId?: string;
  questionnaireResponseId: string;
  startedBy: string;
  batchJobProgress?: number;
  responseLastUpdated: string;
  jobCompletedDateTime?: string;
}
