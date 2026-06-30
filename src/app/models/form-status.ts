import { ValueDisplay } from './value-display';

// Define the union type
export type FormStatusValue = 'preview' | 'not_started' | 'in_progress' | 'complete';

// Type alias for form status options using the generic ValueDisplay interface
export type FormStatusOption = ValueDisplay<FormStatusValue>;

// Single source of truth - the array
export const STATUS_OPTIONS: readonly FormStatusOption[] = [
  { display: 'Preview', value: 'preview' },
  { display: 'Not Started', value: 'not_started' },
  { display: 'In Progress', value: 'in_progress' },
  { display: 'Complete', value: 'complete' },
] as const;

// Derive constants from STATUS_OPTIONS for type-safe comparisons
export const FormStatus = {
  PREVIEW: STATUS_OPTIONS[0].value,
  NOT_STARTED: STATUS_OPTIONS[1].value,
  IN_PROGRESS: STATUS_OPTIONS[2].value,
  COMPLETE: STATUS_OPTIONS[3].value,
} as const;
