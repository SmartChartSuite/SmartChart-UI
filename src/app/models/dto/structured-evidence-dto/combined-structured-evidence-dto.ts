import {ObservationDTO} from "./observation-dto";
import {EncounterDTO} from "./encounter-dto";
import {MedicationRequestDTO} from "./medication-request-dto";
import {ProcedureDTO} from "./procedure-dto";
import {ConditionDTO} from "./condition-dto";
import {FhirBaseResource} from "../../fhir/fhir.base.resource";
import {PatientSummary} from "../../patient-summary";
import {ResourceType} from "./resource-type";

export class CombinedStructuredEvidenceDTO {
  observations: ObservationDTO[];
  encounters: EncounterDTO[];
  medicationRequests: MedicationRequestDTO[];
  procedures: ProcedureDTO[];
  conditions: ConditionDTO[];

  constructor(cqlResources: FhirBaseResource[], patientSummary: PatientSummary) {
    this.observations = cqlResources
      .filter(resource => resource.resourceType == ResourceType.OBSERVATION)
      .map(resource => new ObservationDTO(resource, patientSummary));

    this.encounters = cqlResources
      .filter(resource => resource.resourceType == ResourceType.ENCOUNTER)
      .map(resource => new EncounterDTO(resource, patientSummary));

    this.medicationRequests = cqlResources
      .filter(resource => resource.resourceType == ResourceType.MEDICATION_REQUEST)
      .map(resource => new MedicationRequestDTO(resource, patientSummary));

    this.conditions = cqlResources
      .filter(resource => resource.resourceType == ResourceType.CONDITION)
      .map(resource => new ConditionDTO(resource, patientSummary));

    this.procedures = cqlResources
      .filter(resource => resource.resourceType == ResourceType.PROCEDURE)
      .map(resource => new ProcedureDTO(resource, patientSummary));
  }
}
