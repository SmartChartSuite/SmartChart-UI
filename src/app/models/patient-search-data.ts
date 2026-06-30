import { FormStatusOption } from './form-status';

export const GENDER_OPTIONS = ["Male", "Female", "Other", "Unknown"] as const;
export type GenderOption = typeof GENDER_OPTIONS[number];

export interface PatientSearchData {
  patientName: string;
  gender: GenderOption[];
  dobRange: Date[] | null;
  startedRange: Date[] | null;
  formStatus: FormStatusOption[];
}

export const PATIENT_SEARCH_DATA_DEFAULT: PatientSearchData = {
  patientName: '',
  gender: null,
  dobRange: null,
  startedRange: null,
  formStatus: null
}
