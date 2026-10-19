import { ValueDisplay } from './value-display';

// Define the union type
export type FormStatusValue = 'preview' | 'not-started' | 'in-progress' | 'complete' | 'amended';

// Type alias for form status options using the generic ValueDisplay interface
export type StatusOption = ValueDisplay<FormStatusValue>;

// Single source of truth - the array
export const FORM_STATUS_OPTIONS: readonly StatusOption[] = [
  { display: 'Preview', value: 'preview' },
  { display: 'Not Started', value: 'not-started' },
  { display: 'In Progress', value: 'in-progress' },
  { display: 'Complete', value: 'complete' },
  { display: 'Amended', value: 'amended' },
] as const;

// Derive constants from STATUS_OPTIONS for type-safe comparisons
export const FormStatus = {
  PREVIEW: FORM_STATUS_OPTIONS[0].value,
  NOT_STARTED: FORM_STATUS_OPTIONS[1].value,
  IN_PROGRESS: FORM_STATUS_OPTIONS[2].value,
  COMPLETE: FORM_STATUS_OPTIONS[3].value,
  AMENDED: FORM_STATUS_OPTIONS[4].value,
} as const;
