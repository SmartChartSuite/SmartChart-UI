import { StatusOption } from './form-status';

export const GENDER_OPTIONS = ["Male", "Female", "Other", "Unknown"] as const;
export type GenderOption = typeof GENDER_OPTIONS[number];

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface PatientSearchData {
  patientName: string;
  formName: string;
  patientGender: GenderOption[] | null;
  dobRange: DateRange;
  questionnaireResponseStatus: StatusOption[] | null;
  batchJobStatus: StatusOption[] | null;
  jobRanDateRange: DateRange;
}

export const PATIENT_SEARCH_DATA_DEFAULT: PatientSearchData = {
  patientName: '',
  formName: '',
  patientGender: null,
  dobRange: { start: null, end: null },
  jobRanDateRange: { start: null, end: null },
  questionnaireResponseStatus: null,
  batchJobStatus: null,
}
