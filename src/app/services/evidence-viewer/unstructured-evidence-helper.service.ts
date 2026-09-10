import {Injectable} from '@angular/core';
import {FhirBaseResource} from '../../models/fhir/fhir.base.resource';
import {SupportingEvidence, UnstructuredEvidence} from '../../models/parsed-results';

/**
 * Converts the raw resources used by the NLP evidence flow into the normalized
 * {@link UnstructuredEvidence} model consumed by the evidence viewer.
 *
 * The API exposes the data across two related resource types:
 *
 * 1. The answer Observation, which contains the assertion, evidence text,
 *    reasoning, and a `focus` reference.
 * 2. The matching DocumentReference is supplied separately. It contributes the
 *    evidence date, document type, and original resource used by the source
 *    viewer.
 *
 * This service joins those resources, sorts the resulting evidence by date,
 * and derives the most recent and most common assertion values. It does not
 * mutate either input collection.
 */
@Injectable({
  providedIn: 'root'
})
export class UnstructuredEvidenceHelperService {

  /**
   * Builds the complete unstructured evidence view model.
   *
   * The first supporting item after date sorting supplies
   * `mostRecentAssertionSuggestion`. The most common assertion is calculated
   * from all non-empty assertions; if multiple assertions have the same count,
   * the one appearing first in the date-sorted list wins.
   *
   * Missing Observations or DocumentReferences are treated as empty input. An
   * answer whose DocumentReference cannot be resolved is still represented,
   * with empty date/source fields and no attached resource.
   *
   * @param documentReferences DocumentReference resources returned with the
   * evidence result set.
   * @param answerObservations The NLPQL answer Observations for the question.
   * @returns Normalized, date-sorted unstructured evidence for the viewer.
   */
  parseUnstructuredEvidence(
    documentReferences: FhirBaseResource[] | undefined,
    answerObservations: FhirBaseResource[] | undefined
  ): UnstructuredEvidence {
    const supportingEvidence = this.parseSupportingEvidence(
      documentReferences,
      answerObservations ?? []
    );

    return {
      mostRecentAssertionSuggestion: supportingEvidence[0]?.assertion ?? '',
      mostCommonAssertionSuggestion: this.getMostCommonAssertion(supportingEvidence),
      supportingEvidence
    };
  }

  /**
   * Creates one SupportingEvidence item per answer Observation.
   *
   * The Observation's first `focus.reference` identifies the matching
   * DocumentReference. Observation components provide `resultValue`,
   * `evidenceText`, and `reasoning`; the DocumentReference provides `date`,
   * `type.text`, and the source resource. Unresolved references are retained
   * rather than discarded so the assertion and extracted text remain visible.
   */
  private parseSupportingEvidence(
    documentReferences: FhirBaseResource[],
    answerObservations: FhirBaseResource[]
  ): SupportingEvidence[] {
    const documentReferencesById = this.indexResourcesById(documentReferences);
    const supportingEvidence = (answerObservations ?? []).map(observation => {
      const documentReference = documentReferencesById.get(this.getFocusReference(observation));

      return {
        assertion: this.getComponentValue(observation, 'resultValue'),
        text: this.getComponentValue(observation, 'evidenceText'),
        reasoning: this.getComponentValue(observation, 'reasoning'),
        date: documentReference?.['date'] ?? '',
        source: documentReference?.['type']?.['text'] ?? '',
        resource: documentReference
      };
    });

    return this.sortByDateDesc(supportingEvidence);
  }

  /**
   * Creates a lookup keyed as `resourceType/id`, matching FHIR reference
   * values such as `DocumentReference/123`.
   */
  private indexResourcesById(resources: FhirBaseResource[] | undefined): Map<string, FhirBaseResource> {
    const resourcesById = new Map<string, FhirBaseResource>();
    for (const resource of resources ?? []) {
      if (resource?.id) {
        resourcesById.set(`${resource.resourceType}/${resource.id}`, resource);
      }
    }
    return resourcesById;
  }

  /**
   * Reads the first FHIR focus reference from an answer Observation.
   * Observations without a focus reference return an empty key and therefore
   * produce an unresolved SupportingEvidence resource.
   */
  private getFocusReference(observation: FhirBaseResource): string {
    return observation?.['focus']?.[0]?.['reference'] ?? '';
  }

  /**
   * Reads a component by its first coding code and returns its trimmed
   * `valueString`. Missing components, codes, or values become empty strings.
   */
  private getComponentValue(observation: FhirBaseResource, code: string): string {
    const component = observation?.['component']
      ?.find(component => component?.['code']?.['coding']?.[0]?.['code'] === code);
    return component?.['valueString']?.trim() ?? '';
  }

  /**
   * Returns a new array sorted from most recent to oldest.
   *
   * Missing or invalid dates sort after valid dates. Equal dates retain their
   * input order, which allows the caller's original order to remain the final
   * tie-breaker.
   */
  private sortByDateDesc(supportingEvidence: SupportingEvidence[]): SupportingEvidence[] {
    return [...supportingEvidence].sort((a, b) => {
      const aTime = new Date(a?.date).getTime();
      const bTime = new Date(b?.date).getTime();
      const aValid = !Number.isNaN(aTime);
      const bValid = !Number.isNaN(bTime);

      if (!aValid && !bValid) return 0;
      if (!aValid) return 1;
      if (!bValid) return -1;
      return bTime - aTime;
    });
  }

  /**
   * Counts non-empty assertion values and returns the most common one.
   *
   * Because the input is already sorted by recency and the map is traversed in
   * insertion order, updating only when a count is strictly greater preserves
   * recency as the tie-breaker. Empty assertions are ignored.
   */
  private getMostCommonAssertion(supportingEvidence: SupportingEvidence[]): string {
    const counts = new Map<string, number>();
    for (const evidence of supportingEvidence) {
      if (evidence.assertion) {
        counts.set(evidence.assertion, (counts.get(evidence.assertion) ?? 0) + 1);
      }
    }

    let mostCommon = '';
    let highestCount = 0;
    counts.forEach((count, assertion) => {
      if (count > highestCount) {
        mostCommon = assertion;
        highestCount = count;
      }
    });
    return mostCommon;
  }
}
