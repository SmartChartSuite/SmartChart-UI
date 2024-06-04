import {Component, OnInit} from '@angular/core';
import {EvidenceViewerService} from "../../../services/evidence-viewer/evidence-viewer.service";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";
import {NlpAnswer, ResultSet} from "../../../models/results";
import {filter} from "rxjs";
import {ResourceType} from "../../../models/structured-evidence-dto/resource-type";
import {ObservationDTO} from "../../../models/structured-evidence-dto/observation-dto";
import {ConditionDTO} from "../../../models/structured-evidence-dto/condition-dto";
import {ProcedureDTO} from "../../../models/structured-evidence-dto/procedure-dto";
import {EncounterDTO} from "../../../models/structured-evidence-dto/encounter-dto";
import {MedicationRequestDTO} from "../../../models/structured-evidence-dto/medication-request-dto";


@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnInit {

  cqlResources: FhirBaseResource[] = [];
  nlpResources: FhirBaseResource[] = [];
  nlpAnswers: NlpAnswer[];

  simpleObservations: ObservationDTO[] = [];
  simpleMedicationRequests: MedicationRequestDTO[] = [];
  simpleEncounters: EncounterDTO[] = [];
  simpleConditions: ConditionDTO[] = [];
  simpleProcedures: ProcedureDTO[] = [];

  constructor(private evidenceViewerService: EvidenceViewerService) {
  }
  ngOnInit(): void {
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

        this.mapStructuredEvidence(cqlResources);

        console.log(this.cqlResources);
        console.log(this.nlpResources);
        console.log(this.nlpAnswers);
      }
    })
  }

  //TODO We may want to refactor this code from having a side effect to a pure function
  private mapStructuredEvidence(cqlResources: FhirBaseResource[]) {

    this.simpleObservations = cqlResources
      .filter(resource => resource.resourceType == ResourceType.OBSERVATION)
      .map(resource => new ObservationDTO(resource));

    this.simpleEncounters = cqlResources
      .filter(resource => resource.resourceType == ResourceType.ENCOUNTER)
      .map(resource => new EncounterDTO(resource));

    this.simpleMedicationRequests = cqlResources
      .filter(resource => resource.resourceType == ResourceType.MEDICATION_REQUEST)
      .map(resource => new MedicationRequestDTO(resource));

    this.simpleConditions = cqlResources
      .filter(resource => resource.resourceType == ResourceType.CONDITION)
      .map(resource => new ConditionDTO(resource));

    this.simpleProcedures = cqlResources
      .filter(resource => resource.resourceType == ResourceType.PROCEDURE)
      .map(resource => new ProcedureDTO(resource));
  }
}
