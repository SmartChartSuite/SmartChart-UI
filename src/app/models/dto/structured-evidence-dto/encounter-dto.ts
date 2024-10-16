import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../../fhir/fhir.base.resource";
import {System} from "./system";
import {PatientSummary} from "../../patient-summary";

export class EncounterDTO extends StructuredEvidenceDTO {
  startDateAgeAt: string;
  encounterType: string;
  reasonCode: string;
  reasonSystem: string;
  reasonConceptName: string;
  endDateAgeAt: string;
  sortFilterDate: string;

  constructor(encounter: FhirBaseResource, patientSummary: PatientSummary){
    super();
    const periodStart = encounter["period"]?.["start"];
    this.startDateAgeAt = super.getDateAgeAsStr(periodStart, patientSummary.birthDate); //TODO: verify requirements
    const periodEnd = encounter["period"]?.["end"];
    this.sortFilterDate = periodEnd //TODO verify requirements
    this.endDateAgeAt = super.getDateAgeAsStr(periodEnd, patientSummary.birthDate); //TODO: verify requirements
    this.encounterType = encounter["type"]?.[0]?.["text"] || encounter["type"]?.[0]?.["coding"] ?.[0]?.display

    const firstCodeableConcept = encounter?.["reasonCode"]?.[0];
    const reasonCoding = super.getCodeFromCodeableConcept(firstCodeableConcept, [System.ICD_10, System.SNOMED]);
    this.reasonCode = reasonCoding?.code;
    this.reasonSystem = super.getSystemFromEnum(reasonCoding?.system);
    this.reasonConceptName = firstCodeableConcept?.text || reasonCoding?.display;
  }

}
