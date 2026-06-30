import {FormStatusValue} from "./form-status";

export type JobStatusValue = 'complete' | 'running';

export interface PatientName {
  family: string;
  given: string;
}

export interface PatientGrid {
  formStatus: FormStatusValue;
  patientName: PatientName;
  patientDob: string;
  patientGender: "Male" | "Female" | "Unknown" | "Other";
  jobStatus: JobStatusValue;
  dateRan: string;
  [key: string]: any;
}
