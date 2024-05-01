// TODO: Replace this with the full model library when ready.
export interface FhirBaseResource {
  resourceType: string;
  id?: string;
  meta?: any;
  implicitRules?: string;
  language?: string;
  [key: string]: any;
}
