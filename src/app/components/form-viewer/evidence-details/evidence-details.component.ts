import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EvidenceViewerService} from "../../../services/evidence-viewer/evidence-viewer.service";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";
import {NlpAnswer, ResultSet} from "../../../models/results";
import {filter} from "rxjs";
import {ResourceType} from "../../../models/dto/structured-evidence-dto/resource-type";
import {ObservationDTO} from "../../../models/dto/structured-evidence-dto/observation-dto";
import {ConditionDTO} from "../../../models/dto/structured-evidence-dto/condition-dto";
import {ProcedureDTO} from "../../../models/dto/structured-evidence-dto/procedure-dto";
import {EncounterDTO} from "../../../models/dto/structured-evidence-dto/encounter-dto";
import {MedicationRequestDTO} from "../../../models/dto/structured-evidence-dto/medication-request-dto";
import {PatientSummary} from "../../../models/patient-summary";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";

export interface CombinedStructuralResourcesDTO {
  "observations" : ObservationDTO[]
  "encounters": EncounterDTO[]
  "medicationRequests": MedicationRequestDTO[]
  "procedures": ProcedureDTO[],
  "conditions": ConditionDTO[]
}

@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnChanges, OnInit{

  @Input() activeFormSummary!: ActiveFormSummary | undefined;
  documentsSortDirection: 'asc' | 'desc' = 'desc';

  cqlResources: FhirBaseResource[] = [];
  nlpResources: FhirBaseResource[] = [];
  nlpAnswers: NlpAnswer[];
  protected readonly Object = Object;

  combinedDTODeepCopy: CombinedStructuralResourcesDTO;
  combinedDTO: CombinedStructuralResourcesDTO = {observations: [], procedures: [], conditions: [], medicationRequests: [], encounters : []};

  isDateFilterExpanded = false;

  //Deep copy all resources for filtering operations because the API does not handle filtering or sorting
  nlpAnswersDeepCopy: NlpAnswer[] = [];
  constructor(private evidenceViewerService: EvidenceViewerService,
              private formManagerService: FormManagerService) {
  }

  ngOnInit(): void {
     this.formManagerService.selectedForm$.subscribe(
       value=> console.log(value)
     )
  }

  private mapStructuredEvidence(cqlResources: FhirBaseResource[], patientSummary: PatientSummary) {

    this.combinedDTO.observations =  cqlResources
      .filter(resource => resource.resourceType == ResourceType.OBSERVATION)
      .map(resource => new ObservationDTO(resource, patientSummary));

    this.combinedDTO.encounters = cqlResources
      .filter(resource => resource.resourceType == ResourceType.ENCOUNTER)
      .map(resource => new EncounterDTO(resource, patientSummary));

    this.combinedDTO.medicationRequests = cqlResources
      .filter(resource => resource.resourceType == ResourceType.MEDICATION_REQUEST)
      .map(resource => new MedicationRequestDTO(resource, patientSummary));

    this.combinedDTO.conditions = cqlResources
      .filter(resource => resource.resourceType == ResourceType.CONDITION)
      .map(resource => new ConditionDTO(resource, patientSummary));

    this.combinedDTO.procedures = cqlResources
      .filter(resource => resource.resourceType == ResourceType.PROCEDURE)
      .map(resource => new ProcedureDTO(resource, patientSummary));

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
            this.mapStructuredEvidence(cqlResources, this.activeFormSummary.patientSummary);

            //preserve a copy in case the results are filtered.
            this.nlpAnswersDeepCopy = JSON.parse(JSON.stringify(this.nlpAnswers));
            this.combinedDTODeepCopy = JSON.parse(JSON.stringify(this.combinedDTO))

            console.log(this.cqlResources);
            console.log(this.nlpResources);
            console.log(this.nlpAnswers);
          }
        })
    }
  }

  onFilterByDateRange(event: any) {
    if(!event.startDate && !event.endDate){
      this.combinedDTO = JSON.parse(JSON.stringify(this.combinedDTODeepCopy));
      this.nlpAnswers = JSON.parse(JSON.stringify(this.nlpAnswersDeepCopy));
    }
    else if(event.startDate && event.endDate){
      this.combinedDTO = this.applyDateFilterToStructuredResources(
        this.combinedDTODeepCopy, event.startDate, event.endDate);
      this.nlpAnswers = this.applyDateFilterToUnstructuredResources(this.nlpAnswersDeepCopy, event.startDate, event.endDate);
    }
  }

  private applyDateFilterToStructuredResources(structuredResources: CombinedStructuralResourcesDTO, startDate, endDate): CombinedStructuralResourcesDTO {
    let result: CombinedStructuralResourcesDTO = { observations: [], encounters: [], medicationRequests: [], procedures: [], conditions: [] };
    Object.keys(structuredResources).forEach(key => {
      result[key] = structuredResources[key].filter(item =>
        new Date(item.sortFilterDate) >= new Date(startDate) && new Date(item.sortFilterDate) <= new Date(endDate))
    })
    return result;
  }

  private applyDateFilterToUnstructuredResources(unstructuredResources: NlpAnswer[], startDate, endDate): NlpAnswer[] {
    return  unstructuredResources.filter(item =>
      new Date(item.date) >= new Date(startDate) && new Date(item.date) <= new Date(endDate));
  }

}
