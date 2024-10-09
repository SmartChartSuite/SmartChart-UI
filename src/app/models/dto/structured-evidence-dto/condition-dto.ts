import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../../fhir/fhir.base.resource";
import {System} from "./system";
import {PatientSummary} from "../../patient-summary";

export class ConditionDTO extends StructuredEvidenceDTO {
  dateAgeAt: string;
  code: string;
  system: string;
  conceptName: string;
  onset: string;
  abatement: string;
  sortFilterDate: string;

  constructor(condition: FhirBaseResource, patientSummary: PatientSummary){
    //TODO verify proper implementation when the requirements are finalized
    super();
    const recordedDate = condition["recordedDate"];
    this.sortFilterDate = recordedDate;
    this.dateAgeAt = super.getDateAgeAsStr(recordedDate, patientSummary.birthDate);
    const code = super.getCode(condition, 'code', [System.ICD_10, System.SNOMED]);
    this.code = code?.code;
    this.system  = super.getSystemFromEnum(code?.system);
    this.conceptName = condition?.["code"]?.["text"] || code?.display;
    this.onset = condition["onsetDateTime"] || condition["onsetPeriod"]?.["start"];
    this.abatement = condition["abatementDateTime"];
  }
}
