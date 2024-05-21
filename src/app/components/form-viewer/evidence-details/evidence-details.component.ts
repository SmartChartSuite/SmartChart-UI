import {Component, OnInit} from '@angular/core';
import {EvidenceViewerService} from "../../../services/evidence-viewer/evidence-viewer.service";
import {FhirBaseResource} from "../../../models/fhir/fhir.base.resource";
import {NlpAnswer, ResultSet} from "../../../models/results";
import {
  SimpleCondition,
  SimpleEncounter,
  SimpleMedicationRequest,
  SimpleObservation,
  SimpleProcedure,
  StructuredResultType
} from "../../../models/structured-results";
import {filter, tap} from "rxjs";


@Component({
  selector: 'app-evidence-details',
  templateUrl: './evidence-details.component.html',
  styleUrl: './evidence-details.component.scss'
})
export class EvidenceDetailsComponent implements OnInit {

  cqlResources: FhirBaseResource[] = [];
  nlpResources: FhirBaseResource[] = [];
  nlpAnswers: NlpAnswer[];

  simpleObservations: SimpleObservation[] = [];
  simpleMedicationRequests: SimpleMedicationRequest[] = [];
  simpleEncounters: SimpleEncounter[] = [];
  simpleConditions: SimpleCondition[] = [];
  simpleProcedures: SimpleProcedure[] = [];

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
      .filter(resource => resource.resourceType == StructuredResultType.OBSERVATION)
      .map(resource => new SimpleObservation(resource));

    this.simpleEncounters = cqlResources
      .filter(resource => resource.resourceType == StructuredResultType.ENCOUNTER)
      .map(resource => new SimpleEncounter(resource));

    this.simpleMedicationRequests = cqlResources
      .filter(resource => resource.resourceType == StructuredResultType.MEDICATION_REQUEST)
      .map(resource => new SimpleMedicationRequest(resource));

    this.simpleConditions = cqlResources
      .filter(resource => resource.resourceType == StructuredResultType.CONDITION)
      .map(resource => new SimpleCondition(resource));

    this.simpleProcedures = cqlResources
      .filter(resource => resource.resourceType == StructuredResultType.PROCEDURE)
      .map(resource => new SimpleProcedure(resource));
  }
}
