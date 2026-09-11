import {Component, computed, inject, input, linkedSignal, SecurityContext} from '@angular/core';
import {DatePipe} from "@angular/common";
import {PatientSummary} from "../../../../models/patient-summary";
import {AssertionFilter, SupportingEvidence, UnstructuredEvidence} from "../../../../models/parsed-results";
import {MatButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {openDocumentViewerModal} from "../../document-viewer-modal/document-viewer-modal.component";
import {EvidenceHelperService} from "../../../../services/evidence-viewer/evidence-helper.service";
import {MatChipListbox, MatChipOption} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";

/** The label of the filter that shows every evidence item. */
const ALL_EVIDENCE_LABEL = 'All Evidence';

/** The label of the filter that shows evidence with no assertion. */
const NO_ASSERTION_LABEL = 'No Assertion Found';

/** Assertion value of the filter that matches every evidence item. */
const MATCHES_ANY_ASSERTION = null;

/** Assertion value of the filter that matches evidence with no assertion. */
const MISSING_ASSERTION = '';

@Component({
  selector: 'app-unstructured-evidence',
  imports: [
    MatButton,
    DatePipe,
    MatChipListbox,
    MatChipOption,
    MatIcon
  ],
  templateUrl: './unstructured-evidence.component.html',
  styleUrl: './unstructured-evidence.component.scss',
})
export class UnstructuredEvidenceComponent{

  readonly evidence = input.required<UnstructuredEvidence>();
  readonly patientSummary = input.required<PatientSummary>();

  private readonly evidenceHelper = inject(EvidenceHelperService);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);

  /** Supporting evidence in the order produced by the parser (most recent first). */
  private readonly supportingEvidence = computed(() => this.evidence().supportingEvidence ?? []);

  /**
   * The chip filters offered for the current evidence, in display order:
   *
   * 1. "All Evidence", which matches every item.
   * 2. One filter per distinct assertion. Because the supporting evidence is
   *    already sorted most-recent-first and the counting map preserves
   *    insertion order, these come out ordered by recency.
   * 3. "No Assertion Found", which matches items whose assertion is missing.
   *
   * Every filter carries the number of items it matches, so the chips can show
   * counts and disable themselves when they would match nothing. The first and
   * last filters are always present, even at a count of zero, to keep the chip
   * row stable as the user moves between questions.
   */
  readonly assertionFilters = computed<AssertionFilter[]>(() => {
    const supportingEvidence = this.supportingEvidence();
    const countsByAssertion = new Map<string, number>();
    let missingAssertionCount = 0;

    for (const evidence of supportingEvidence) {
      if (evidence.assertion) {
        countsByAssertion.set(evidence.assertion, (countsByAssertion.get(evidence.assertion) ?? 0) + 1);
      } else {
        missingAssertionCount++;
      }
    }

    const allEvidenceFilter: AssertionFilter = {
      label: ALL_EVIDENCE_LABEL,
      assertion: MATCHES_ANY_ASSERTION,
      count: supportingEvidence.length
    };

    const assertionFilters: AssertionFilter[] = [];
    countsByAssertion.forEach((count, assertion) => {
      assertionFilters.push({label: assertion, assertion, count});
    });

    const missingAssertionFilter: AssertionFilter = {
      label: NO_ASSERTION_LABEL,
      assertion: MISSING_ASSERTION,
      count: missingAssertionCount
    };

    return [allEvidenceFilter, ...assertionFilters, missingAssertionFilter];
  });

  /**
   * The label of the selected filter. Defaults to "All Evidence" and resets
   * back to it whenever the evidence changes, so selecting a new question
   * always starts from the full list.
   */
  readonly selectedFilterLabel = linkedSignal<string>(() => {
    // Read the evidence so the selection resets when the question changes.
    this.supportingEvidence();
    return ALL_EVIDENCE_LABEL;
  });

  /**
   * The evidence items matched by the selected filter, keeping the parser's
   * most-recent-first order.
   *
   * Returns every item for the "all evidence" filter, or when the selected
   * label no longer matches a filter (possible while switching questions).
   * Otherwise items are matched on their assertion, treating a missing
   * assertion as {@link MISSING_ASSERTION} so the "No Assertion Found" filter
   * collects them.
   */
  readonly filteredEvidence = computed<SupportingEvidence[]>(() => {
    const selectedLabel = this.selectedFilterLabel();
    const selectedFilter = this.assertionFilters().find(filter => filter.label === selectedLabel);

    if (!selectedFilter || selectedFilter.assertion === MATCHES_ANY_ASSERTION) {
      return this.supportingEvidence();
    }
    return this.supportingEvidence()
      .filter(evidence => (evidence.assertion || MISSING_ASSERTION) === selectedFilter.assertion);
  });

  /** The patient's age at the time the given evidence was documented. */
  protected getAgeAt(evidence: SupportingEvidence): string {
    return this.evidenceHelper.getAgeAt(evidence.date, this.patientSummary().birthDate);
  }

  /**
   * Applies the chosen filter. Deselecting a chip emits no value, which falls
   * back to showing all evidence rather than an empty list.
   */
  protected onSelectFilter(label: string | null | undefined): void {
    this.selectedFilterLabel.set(label ?? ALL_EVIDENCE_LABEL);
  }

  protected onViewEvidence(evidence: SupportingEvidence): void {
    const content = this.getDocumentContent(evidence);
    const safeHtmlFullText = this.sanitizer.sanitize(SecurityContext.HTML, content) ?? '';

    openDocumentViewerModal(this.dialog, {
      title: 'Document Content',
      content,
      htmlContent: safeHtmlFullText,
      size: {
        minWidth: '500px',
        minHeight: '300px'
      }
    }).subscribe();
  }

  private getDocumentContent(evidence: SupportingEvidence): string {
    const encodedDocument = evidence.resource?.['content']?.[0]?.['attachment']?.['data'];
    if (!encodedDocument) {
      return evidence.text;
    }

    try {
      return atob(encodedDocument);
    } catch {
      // Fall back to the extracted evidence text when document content is invalid.
      return evidence.text;
    }
  }
}
