import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EvidenceViewerService} from "../../../services/evidence-viewer/evidence-viewer.service";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";
import {NlpAnswer, ResultSet} from "../../../models/results";
import {filter} from "rxjs";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";
import {
  CombinedStructuredEvidenceDTO
} from "../../../models/dto/structured-evidence-dto/combined-structured-evidence-dto";

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnChanges{

  @Input() activeFormSummary!: ActiveFormSummary | undefined;
  documentsSortDirection: 'asc' | 'desc' = 'desc';

  cqlResources: FhirBaseResource[] = [];
  nlpResources: FhirBaseResource[] = [];
  nlpAnswers: NlpAnswer[];
  protected readonly Object = Object;

  combinedDTODeepCopy: CombinedStructuredEvidenceDTO;
  combinedDTO: CombinedStructuredEvidenceDTO = {observations: [], procedures: [], conditions: [], medicationRequests: [], encounters : []};

  isDateFilterExpanded = false;

  //Deep copy all resources for filtering operations because the API does not handle filtering or sorting
  nlpAnswersDeepCopy: NlpAnswer[] = [];
  constructor(private evidenceViewerService: EvidenceViewerService,
              private formManagerService: FormManagerService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['activeFormSummary']?.currentValue){
      this.evidenceViewerService.resultSet$
        .pipe(
          filter(value=> Object.keys(value).length !== 0))
        .subscribe({
          next: (resultSet: ResultSet) => {
            const evidenceList = resultSet.evidence;
            const [cqlResources, nlpResources] = evidenceList.reduce(([cqlResources, nlpResources], resource) => {
              (resource.resourceType === "DocumentReference" ? nlpResources : cqlResources).push(resource);
              return [cqlResources, nlpResources];
            }, [[], []]);
            this.cqlResources = cqlResources;
            this.nlpResources = nlpResources;
            this.nlpAnswers = resultSet.nlpAnswers;

            this.combinedDTO = new CombinedStructuredEvidenceDTO(cqlResources, this.activeFormSummary.patientSummary);
            //preserve a copy in case the results are filtered.
            this.nlpAnswersDeepCopy = this.deepCopy(this.nlpAnswers);
            this.combinedDTODeepCopy = this.deepCopy(this.combinedDTO);
          }
        })
    }
  }

  onFilterByDateRange(event: any) {
    this.combinedDTO = this.deepCopy(this.combinedDTODeepCopy);
    this.nlpAnswers = this.nlpAnswersDeepCopy;
    if(event.startDate && event.endDate){
      this.combinedDTO = this.deepCopy(this.combinedDTODeepCopy);
      this.nlpAnswers = this.nlpAnswersDeepCopy;
      this.combinedDTO = this.applyDateFilterToStructuredResources(
        this.combinedDTODeepCopy, event.startDate, event.endDate);
      this.nlpAnswers = this.applyDateFilterToUnstructuredResources(this.nlpAnswersDeepCopy, event.startDate, event.endDate);
    }
  }

  private applyDateFilterToStructuredResources(structuredResources: CombinedStructuredEvidenceDTO, startDate, endDate): CombinedStructuredEvidenceDTO {
    let result: CombinedStructuredEvidenceDTO = { observations: [], encounters: [], medicationRequests: [], procedures: [], conditions: [] };
    Object.keys(structuredResources).forEach(key => {
      result[key] = structuredResources[key].filter(item =>
        new Date(item.sortFilterDate) >= new Date(startDate) && new Date(item.sortFilterDate) <= new Date(endDate))
    });
    return result;
  }

  private applyDateFilterToUnstructuredResources(unstructuredResources: NlpAnswer[], startDate, endDate): NlpAnswer[] {
    if(!unstructuredResources){
      return null;
    }
    return  unstructuredResources.filter(item =>
      new Date(item.date) >= new Date(startDate) && new Date(item.date) <= new Date(endDate));
  }

  private deepCopy(object: any){
    if(!object){
      return null;
    }
    return JSON.parse(JSON.stringify(object));
  }

}
