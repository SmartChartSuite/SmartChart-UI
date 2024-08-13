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

  simpleObservations: ObservationDTO[] = [];
  simpleMedicationRequests: MedicationRequestDTO[] = [];
  simpleEncounters: EncounterDTO[] = [];
  simpleConditions: ConditionDTO[] = [];
  simpleProcedures: ProcedureDTO[] = [];

  isDateFilterExpanded = false;

  //Deep copy all resources for filtering operations because the API does not handle filtering or sorting
  nlpResourcesDeepCopy: FhirBaseResource[] = [];
  simpleObservationsDeepCopy: ObservationDTO[] = [];
  simpleEncountersDeepCopy: EncounterDTO[] = [];
  simpleMedicationRequestsDeepCopy: EncounterDTO[] = [];
  simpleProceduresDeepCopy: ProcedureDTO[] = [];

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

    this.simpleObservations =  this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.OBSERVATION), 'effectiveDateTime', 'desc')
      .map(resource => new ObservationDTO(resource, patientSummary));

    this.simpleEncounters = this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.ENCOUNTER), ["period", "start"], 'desc')
      .map(resource => new EncounterDTO(resource, patientSummary));

    this.simpleMedicationRequests = this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.MEDICATION_REQUEST), 'authoredOn', 'desc')
      .map(resource => new MedicationRequestDTO(resource, patientSummary));

    this.simpleConditions = this.sortByDatePipe.transform(cqlResources
      .filter(resource => resource.resourceType == ResourceType.CONDITION), 'recordedDate', 'desc')
      .map(resource => new ConditionDTO(resource, patientSummary));

    this.simpleProcedures = cqlResources
      .filter(resource => resource.resourceType == ResourceType.PROCEDURE)
      .map(resource => new ProcedureDTO(resource, patientSummary));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['patientSummary']?.currentValue){
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

            this.simpleObservationsDeepCopy = JSON.parse(JSON.stringify(this.simpleObservations));
            this.simpleEncountersDeepCopy = JSON.parse(JSON.stringify(this.simpleEncounters));
            this.simpleMedicationRequestsDeepCopy = JSON.parse(JSON.stringify(this.simpleMedicationRequests));
            this.simpleProceduresDeepCopy = JSON.parse(JSON.stringify(this.simpleProcedures));

            console.log(this.cqlResources);
            console.log(this.nlpResources);
            console.log(this.nlpAnswers);
          }
        })
    }
  }

  filterDataByDateRange(event: any) {
    console.log(event);
    console.log(this.cqlResources);
    console.log(this.nlpResources);
  }
}
