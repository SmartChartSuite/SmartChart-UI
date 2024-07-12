import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../../fhir/fhir.base.resource";
import {System} from "./system";
import {PatientSummary} from "../../patient-summary";

export class ProcedureDTO extends StructuredEvidenceDTO {
  datePerformed: string;
  code: string;
  system : string;
  conceptName: string;
  constructor(procedure: FhirBaseResource, patientSummary: PatientSummary){
    //TODO verify proper implementation when the requirements are finalized
    console.log(procedure) //TODO: Remove console.log
    super();
    const code = super.getCode(procedure,'code', [System.CPT]);
    this.code = code?.code;
    this.system  = super.getSystemFromEnum(code?.system);
    this.conceptName = procedure["code"]?.["text"] || procedure["code"]?.["coding"]?.["display"];
  }
}
