import {Component, computed, inject, input, linkedSignal, SecurityContext} from '@angular/core';
import {DatePipe} from "@angular/common";
import {PatientSummary} from "../../../../models/patient-summary";
import {SupportingEvidence, UnstructuredEvidence} from "../../../../models/parsed-results";
import {SortByDatePipe} from "../../../../pipe/sort-by-date.pipe";
import {MatButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {openDocumentViewerModal} from "../../document-viewer-modal/document-viewer-modal.component";
import {EvidenceHelperService} from "../../../../services/evidence-viewer/evidence-helper.service";
import {MatChipOption, MatChipSet} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-unstructured-evidence',
  imports: [
    SortByDatePipe,
    MatButton,
    DatePipe,
    MatChipSet,
    MatChipOption,
    MatIcon
  ],
  templateUrl: './unstructured-evidence.component.html',
  styleUrl: './unstructured-evidence.component.scss',
})
export class UnstructuredEvidenceComponent{

  readonly evidence = input.required<UnstructuredEvidence>();
  readonly patientSummary = input.required<PatientSummary>();
  readonly selectedEvidence = linkedSignal<SupportingEvidence | null>(
    () => this.evidence().supportingEvidence?.[0] ?? null
  );
  readonly ageAt = computed(() => {
    const selectedEvidence = this.selectedEvidence();
    return selectedEvidence
      ? this.evidenceHelper.getAgeAt(selectedEvidence.date, this.patientSummary().birthDate)
      : '';
  });

  private readonly evidenceHelper = inject(EvidenceHelperService);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);

  protected onSelectEvidence(evidence: SupportingEvidence): void {
    this.selectedEvidence.set(evidence);
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
