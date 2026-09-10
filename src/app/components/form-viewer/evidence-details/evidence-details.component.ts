import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EvidenceViewerService} from "../../../services/evidence-viewer/evidence-viewer.service";
import {ResultSet} from "../../../models/results";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";
import {Evidence} from "../../../models/parsed-results";
import {filter} from "rxjs";
import {ActiveFormSummary} from "../../../models/active-form-summary";
import {StructuredEvidenceComponent} from "./structured-evidence/structured-evidence.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {StructuredEvidenceHelperService} from "../../../services/evidence-viewer/structured-evidence-helper.service";
import {UnstructuredEvidenceHelperService} from "../../../services/evidence-viewer/unstructured-evidence-helper.service";
import {UnstructuredEvidenceComponent} from "./unstructured-evidence/unstructured-evidence.component";

/** Tab indexes in the order the tabs are declared in the template. */
const STRUCTURED_TAB_INDEX = 0;
const UNSTRUCTURED_TAB_INDEX = 1;

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [StructuredEvidenceComponent, MatExpansionModule, UnstructuredEvidenceComponent, MatTabGroup, MatTab]
})
export class EvidenceDetailsComponent implements OnChanges {

  @Input() activeFormSummary!: ActiveFormSummary | undefined;

  evidence: Evidence = {
    structured: [],
    unstructured: {
      mostRecentAssertionSuggestion: '',
      mostCommonAssertionSuggestion: '',
      supportingEvidence: []
    }
  };

  /**
   * The tab shown when evidence loads. Structured is preferred, so the
   * unstructured tab only opens when it is the sole tab with evidence.
   */
  selectedTabIndex = STRUCTURED_TAB_INDEX;

  constructor(private evidenceViewerService: EvidenceViewerService,
              private structuredEvidenceHelper: StructuredEvidenceHelperService,
              private unstructuredEvidenceHelper: UnstructuredEvidenceHelperService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeFormSummary']?.currentValue) {
      this.evidenceViewerService.resultSet$
        .pipe(
          filter(value => Object.keys(value).length !== 0))
        .subscribe({
          next: (resultSet: ResultSet) => {
            const evidenceList = resultSet.evidence ?? [];
            const [cqlResources, documentReferences] = evidenceList.reduce(
              ([cqlResources, documentReferences], resource) => {
                (resource.resourceType === "DocumentReference" ? documentReferences : cqlResources)
                  .push(resource);
                return [cqlResources, documentReferences];
              }, [[], []] as [FhirBaseResource[], FhirBaseResource[]]);

            this.evidence = {
              // Structured evidence: non-DocumentReference FHIR resources, grouped and sorted.
              structured: this.structuredEvidenceHelper.parseStructuredEvidence(cqlResources),
              // Unstructured evidence: parsed from the raw DocumentReference resources
              // and the answer Observations that reference them.
              unstructured: this.unstructuredEvidenceHelper.parseUnstructuredEvidence(
                documentReferences, resultSet.nlpAnswerObservations)
            };
            this.selectedTabIndex = this.getInitialTabIndex();
          }
        })
    }
  }

  /**
   * Selects the structured tab unless unstructured evidence is the only
   * evidence found, in which case the unstructured tab is selected.
   */
  private getInitialTabIndex(): number {
    const hasStructured = !!this.evidence.structured?.length;
    const hasUnstructured = !!this.evidence.unstructured?.supportingEvidence?.length;

    return !hasStructured && hasUnstructured ? UNSTRUCTURED_TAB_INDEX : STRUCTURED_TAB_INDEX;
  }
}
