import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../fhir/fhir.base.resource";
import {System} from "./system";

export class ConditionDTO extends StructuredEvidenceDTO {
  date: string;
  code: string;
  system: string;
  conceptName: string;
  onset: string;
  abatement: string;
  constructor(condition: FhirBaseResource){
    //TODO verify proper implementation when the requirements are finalized
    super();
    console.log(condition); //TODO: Remove console.log
    this.date = condition["recordedDate"];
    const code = super.getCode(condition, 'code', [System.ICD_10, System.SNOMED]);
    this.code = code?.code;
    this.system  = super.getSystemFromEnum(code?.system);
    this.conceptName = condition?.["code"]?.["text"] || code?.display;
    this.onset = condition["onsetDateTime"] || condition["onsetPeriod"]?.["start"];
    this.abatement = condition["abatementDateTime"];
  }
}
