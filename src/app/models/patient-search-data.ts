import { FormStatusOption } from './form-status';

export const GENDER_OPTIONS = ["Male", "Female", "Other", "Unknown"] as const;
export type GenderOption = typeof GENDER_OPTIONS[number];

export interface PatientSearchData {
  patientName: string;
  gender: GenderOption[] | null;
  dobRange: [Date | null, Date | null] | null;
  startedRange: [Date | null, Date | null] | null;
  formStatus: FormStatusOption[] | null;
}

export const PATIENT_SEARCH_DATA_DEFAULT: PatientSearchData = {
  patientName: '',
  gender: null,
  dobRange: null,
  startedRange: null,
  formStatus: null
}
