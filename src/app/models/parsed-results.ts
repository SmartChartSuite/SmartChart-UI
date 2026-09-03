import {NlpAnswer} from "./results";

/** Observation-specific rendered details. */
export interface ObservationDetails {
  /** Rendered value (from valueQuantity / valueString / valueCodeableConcept). */
  value: string;
}

/** Condition-specific rendered details. */
export interface ConditionDetails {
  onset?: string;
  abatement?: string;
}

/** MedicationRequest-specific rendered details. */
export interface MedicationRequestDetails {
  dosageInstructions?: string;
}

/** Encounter-specific rendered details. */
export interface EncounterDetails {
  start?: string;
  end?: string;
  type?: string;
  reasonText?: string;
  reasonCode?: string;
  reasonSystem?: string;
}

/** Procedure-specific rendered details. */
export interface ProcedureDetails {
  status?: string;
  category?: string;
  reason?: string;
}

/** The type-specific details carried by a parsed resource. */
export type ParsedResourceDetails =
  | ObservationDetails
  | ConditionDetails
  | MedicationRequestDetails
  | EncounterDetails
  | ProcedureDetails;

/** Fields common to every parsed resource. */
interface ParsedResourceBase {
  /** Human-readable name/label (e.g. "Cause of death"). */
  name?: string;
  /** Friendly system label (e.g. LOINC, ICD-10, SNOMED CT). */
  system: string;
  /** The resolved primary code. */
  code?: string;
  /** The date used for sorting this resource (ISO string). */
  dateForSorting?: string;
}

export interface ParsedObservation extends ParsedResourceBase {
  resourceType: 'Observation';
  details: ObservationDetails;
}

export interface ParsedCondition extends ParsedResourceBase {
  resourceType: 'Condition';
  details: ConditionDetails;
}

export interface ParsedMedicationRequest extends ParsedResourceBase {
  resourceType: 'MedicationRequest';
  details: MedicationRequestDetails;
}

export interface ParsedEncounter extends ParsedResourceBase {
  resourceType: 'Encounter';
  details: EncounterDetails;
}

export interface ParsedProcedure extends ParsedResourceBase {
  resourceType: 'Procedure';
  details: ProcedureDetails;
}

/**
 * A single structured resource, normalized for display. Discriminated on
 * `resourceType` so `details` narrows to the matching type in templates.
 */
export type ParsedResource =
  | ParsedObservation
  | ParsedCondition
  | ParsedMedicationRequest
  | ParsedEncounter
  | ParsedProcedure;

/**
 * A set of parsed resources that share the same resourceType AND the same code.
 * Resources are sorted by date (most recent first).
 */
export interface ParsedCodeGroup {
  /** The FHIR resourceType shared by every resource in this group. */
  resourceType: string;
  /** The human-readable name shared by every resource in this group. */
  name?: string;
  /** The code shared by every resource in this group. */
  code?: string;
  /** The system shared by every resource in this group (friendly label). */
  system: string;
  /** The latest date in this group (the first resource's dateForSorting). */
  latestDate?: string;
  /**
   * The most-recent type-specific highlight surfaced to the group header,
   * taken from the first (most recent) resource:
   *  - Observation:       most recent value
   *  - Procedure:         most recent reason
   */
  highlight?: string;
  /** Parsed resources belonging to this code group, sorted by date (most recent first). */
  resources: ParsedResource[];
}

/**
 * The structured branch of the evidence: a flat list of code groups (grouped
 * by resourceType then code) sorted by each group's latest date (most recent first).
 */
export type StructuredEvidence = ParsedCodeGroup[];

/**
 * The parsed evidence, split into two top-level branches:
 *  - structured: FHIR resources (Observation, Condition, etc.) grouped by resourceType.
 *  - unstructured: raw NLP answers, copied as-is (not grouped for now).
 */
export interface Evidence {
  structured: StructuredEvidence;
  unstructured: NlpAnswer[];
}
