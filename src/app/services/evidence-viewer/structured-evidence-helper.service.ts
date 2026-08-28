import {Injectable} from '@angular/core';
import {FhirBaseResource} from "../../models/fhir/fhir.base.resource";
import {StructuredEvidence, ParsedCodeGroup, ParsedResource} from "../../models/parsed-results";
import {StructuredEvidenceDTO} from "../../models/dto/structured-evidence-dto/structured-evidence-dto";
import {System} from "../../models/dto/structured-evidence-dto/system";

/**
 * Transforms a flat list of structured FHIR resources into the grouped, sorted
 * StructuredEvidence structure consumed by the evidence viewer.
 */
@Injectable({
  providedIn: 'root'
})
export class StructuredEvidenceHelperService {

  /**
   * Shared code/system resolver. Reuses the same logic (getCode /
   * getCodeFromCodeableConcept / getSystemFromEnum) that the per-type DTOs use.
   */
  private readonly codeResolver = new StructuredEvidenceDTO();

  /**
   * Parses a flat list of structured FHIR resources into typed ParsedResource
   * objects, groups them by resourceType then by code, sorts each group's
   * resources by date (most recent first), and returns a flat list of code
   * groups sorted by each group's latest date (most recent first). This
   * interleaves resourceTypes: e.g. Observations of code A, then Procedures,
   * then Observations of code B, ...
   */
  parseStructuredEvidence(resources: FhirBaseResource[]): StructuredEvidence {
    if (!resources || resources.length === 0) {
      return [];
    }

    // Group by resourceType, then by code within each resourceType.
    const byTypeAndCode = new Map<string, ParsedCodeGroup>();
    for (const resource of resources) {
      const parsed = this.toParsedResource(resource);
      const key = `${parsed.resourceType}|${parsed.code ?? ''}`;

      if (!byTypeAndCode.has(key)) {
        byTypeAndCode.set(key, {
          resourceType: parsed.resourceType,
          name: parsed.name,
          code: parsed.code,
          system: parsed.system,
          resources: []
        });
      }
      byTypeAndCode.get(key).resources.push(parsed);
    }

    const groups = Array.from(byTypeAndCode.values());

    // Sort each group's resources by date (most recent first), then set the
    // group's latest date and highlight from the first (most recent) resource.
    for (const group of groups) {
      group.resources.sort((a, b) => this.compareDateDesc(a.dateForSorting, b.dateForSorting));
      const mostRecent = group.resources[0];
      group.latestDate = mostRecent?.dateForSorting;
      group.highlight = this.getHighlight(mostRecent);
    }

    // Sort the groups by their latest date (most recent first).
    groups.sort((a, b) => this.compareDateDesc(a.latestDate, b.latestDate));

    return groups;
  }

  /**
   * The type-specific highlight surfaced to the group header, taken from the
   * most-recent resource:
   *  - Observation:       value
   *  - Procedure:         reason
   *  - MedicationRequest: dosage instructions
   *  - Condition:         none
   *  - Encounter:         none
   */
  private getHighlight(resource: ParsedResource | undefined): string | undefined {
    if (!resource) return undefined;
    if (resource.resourceType === 'Observation') {
      return resource.details.value;
    } else if (resource.resourceType === 'Procedure') {
      return resource.details.reason;
    } else if (resource.resourceType === 'MedicationRequest') {
      return resource.details.dosageInstructions;
    } else {
      return undefined;
    }
  }

  /** Compares two date strings descending (most recent first); undefined sorts last. */
  private compareDateDesc(a: string | undefined, b: string | undefined): number {
    const aTime = a ? new Date(a).getTime() : NaN;
    const bTime = b ? new Date(b).getTime() : NaN;
    const aValid = !isNaN(aTime);
    const bValid = !isNaN(bTime);
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return bTime - aTime;
  }

  /** Builds a normalized ParsedResource from a raw FHIR resource. */
  private toParsedResource(resource: FhirBaseResource): ParsedResource {
    const coding = this.getPrimaryCoding(resource);
    const base = {
      name: this.getName(resource, coding),
      system: this.codeResolver.getSystemFromEnum(coding?.system),
      code: coding?.code,
      dateForSorting: this.getDateForSorting(resource)
    };
    const resourceType = resource?.resourceType;

    if (resourceType === 'Condition') {
      return {
        ...base,
        resourceType: 'Condition',
        details: {
          onset: resource?.['onsetDateTime'] ?? resource?.['onsetPeriod']?.['start'],
          abatement: resource?.['abatementDateTime'] ?? resource?.['abatementPeriod']?.['end']
        }
      };
    } else if (resourceType === 'MedicationRequest') {
      return {
        ...base,
        resourceType: 'MedicationRequest',
        details: {dosageInstructions: resource?.['dosageInstruction']?.[0]?.['text']}
      };
    } else if (resourceType === 'Encounter') {
      return {
        ...base,
        resourceType: 'Encounter',
        details: {
          start: resource?.['period']?.['start'],
          end: resource?.['period']?.['end']
        }
      };
    } else if (resourceType === 'Procedure') {
      return {
        ...base,
        resourceType: 'Procedure',
        details: {
          status: resource?.['status'],
          category: resource?.['category']?.['text'] ?? resource?.['category']?.['coding']?.[0]?.['display'],
          reason: resource?.['reasonCode']?.[0]?.['text'] ?? resource?.['reasonCode']?.[0]?.['coding']?.[0]?.['display']
        }
      };
    } else {
      // Observation (and any other type) renders a single value.
      return {
        ...base,
        resourceType: 'Observation',
        details: {value: this.getObservationValue(resource)}
      };
    }
  }

  /**
   * The human-readable name/label for a resource. Mirrors the DTO conceptName
   * logic: the codeable-concept text, falling back to the coding display.
   */
  private getName(resource: FhirBaseResource, coding: any): string | undefined {
    const resourceType = resource?.resourceType;
    let text: string | undefined;
    if (resourceType === 'MedicationRequest') {
      text = resource?.['medicationCodeableConcept']?.['text'];
    } else if (resourceType === 'Encounter') {
      text = resource?.['reasonCode']?.[0]?.['text'];
    } else {
      text = resource?.['code']?.['text'];
    }
    return text ?? coding?.display;
  }

  /**
   * Selects the primary coding, resolved the same way the corresponding DTO
   * resolves it in combinedDTO:
   *  - Observation:       code, preferred [LOINC]
   *  - Condition:         code, preferred [ICD-10, SNOMED]
   *  - MedicationRequest: medicationCodeableConcept, preferred [RxNorm]
   *  - Procedure:         code, preferred [CPT]
   *  - Encounter:         reasonCode[0], preferred [ICD-10, SNOMED]
   */
  private getPrimaryCoding(resource: FhirBaseResource): any {
    const resourceType = resource?.resourceType;
    if (resourceType === 'Observation') {
      return this.codeResolver.getCode(resource, 'code', [System.LOINC]);
    } else if (resourceType === 'Condition') {
      return this.codeResolver.getCode(resource, 'code', [System.ICD_10, System.SNOMED]);
    } else if (resourceType === 'MedicationRequest') {
      return this.codeResolver.getCode(resource, 'medicationCodeableConcept', [System.RX_NORM]);
    } else if (resourceType === 'Procedure') {
      return this.codeResolver.getCode(resource, 'code', [System.CPT]);
    } else if (resourceType === 'Encounter') {
      return this.codeResolver.getCodeFromCodeableConcept(resource?.['reasonCode']?.[0], [System.ICD_10, System.SNOMED]);
    } else {
      return this.codeResolver.getCode(resource, 'code');
    }
  }

  /** The date used to sort a resource, by resourceType. */
  private getDateForSorting(resource: FhirBaseResource): string | undefined {
    const resourceType = resource?.resourceType;
    if (resourceType === 'Observation') {
      return resource?.['effectiveDateTime']
        ?? resource?.['effectivePeriod']?.['start']
        ?? resource?.['issued'];
    } else if (resourceType === 'Condition') {
      return resource?.['abatementDateTime']
        ?? resource?.['abatementPeriod']?.['end']
        ?? resource?.['onsetDateTime']
        ?? resource?.['onsetPeriod']?.['start']
        ?? resource?.['recordedDate'];
    } else if (resourceType === 'MedicationRequest') {
      return resource?.['authoredOn'];
    } else if (resourceType === 'Encounter') {
      return resource?.['period']?.['end'] ?? resource?.['period']?.['start'];
    } else if (resourceType === 'Procedure') {
      return resource?.['performedDateTime'] ?? resource?.['performedPeriod']?.['start'];
    } else {
      return undefined;
    }
  }

  /** Renders an Observation value from its value[x] field. */
  private getObservationValue(resource: FhirBaseResource): string {
    if (resource?.['valueQuantity']?.['value'] != null && resource?.['valueQuantity']?.['unit']) {
      return `${resource['valueQuantity']['value']} ${resource['valueQuantity']['unit']}`;
    } else if (resource?.['valueString']) {
      return resource['valueString'];
    } else if (resource?.['valueCodeableConcept']) {
      return resource['valueCodeableConcept']?.['text']
        ?? resource['valueCodeableConcept']?.['coding']?.[0]?.['display']
        ?? '';
    } else {
      return '';
    }
  }
}
