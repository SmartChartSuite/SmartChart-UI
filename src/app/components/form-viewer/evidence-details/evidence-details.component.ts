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
import {SortByDatePipe} from "../../../pipe/sort-by-date.pipe";
import {FormManagerService} from "../../../services/form-manager/form-manager.service";
import {ActiveFormSummary} from "../../../models/active-form-summary";

export interface CombinedDTO{
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

  combinedDTODeepCopy: CombinedDTO;
  combinedDTO: CombinedDTO = {observations: [], procedures: [], conditions: [], medicationRequests: [], encounters : []};

  isDateFilterExpanded = false;

  //Deep copy all resources for filtering operations because the API does not handle filtering or sorting
  nlpResourcesDeepCopy: FhirBaseResource[] = [];
  constructor(private evidenceViewerService: EvidenceViewerService,
              private sortByDatePipe: SortByDatePipe,
              private formManagerService: FormManagerService) {
  }

  ngOnInit(): void {
     this.formManagerService.selectedForm$.subscribe(
       value=> console.log(value)
     )
  }

  private mapStructuredEvidence(cqlResources: FhirBaseResource[], patientSummary: PatientSummary) {

    this.combinedDTO.observations =  this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.OBSERVATION), 'effectiveDateTime', 'desc')
      .map(resource => new ObservationDTO(resource, patientSummary));

    this.combinedDTO.encounters = this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.ENCOUNTER), ["period", "start"], 'desc')
      .map(resource => new EncounterDTO(resource, patientSummary));

    this.combinedDTO.medicationRequests = this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.MEDICATION_REQUEST), 'authoredOn', 'desc')
      .map(resource => new MedicationRequestDTO(resource, patientSummary));

    this.combinedDTO.conditions = this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.CONDITION), 'recordedDate', 'desc')
      .map(resource => new ConditionDTO(resource, patientSummary));

    this.combinedDTO.procedures = cqlResources
      .filter(resource => resource.resourceType == ResourceType.PROCEDURE)
      .map(resource => new ProcedureDTO(resource, patientSummary));

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
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
            this.nlpResourcesDeepCopy = JSON.parse(JSON.stringify(this.nlpResources));
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
      this.combinedDTO = this.combinedDTODeepCopy = JSON.parse(JSON.stringify(this.combinedDTODeepCopy))
    }
    else if(event.startDate && event.endDate){
      this.combinedDTO = this.applyDateFilterToStructuredResources(
        this.combinedDTODeepCopy, event.startDate, event.endDate);
    }
  }

  private applyDateFilterToStructuredResources(param: CombinedDTO, startDate, endDate): CombinedDTO {
    let result: CombinedDTO = { observations: [], encounters: [], medicationRequests: [], procedures: [], conditions: [] };
    Object.keys(param).forEach(key => {
      result[key] = param[key].filter(item =>
        new Date(item.sortFilterDate) >= new Date(startDate) && new Date(item.sortFilterDate) <= new Date(endDate))
    })
    return result;
  }

  protected readonly Object = Object;
}
