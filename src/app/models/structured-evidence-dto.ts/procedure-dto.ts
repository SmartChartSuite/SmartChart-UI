import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../fhir/fhir.base.resource";

export class ProcedureDTO extends StructuredEvidenceDTO {
  datePerformed: string;
  code: string;
  system : string;
  conceptName: string;
  constructor(procedure: FhirBaseResource){
    console.log(procedure) //TODO: Remove console.log
    super();
    const code = super.getCode(procedure); //TODO implement when the requirement is known
    this.code = code?.code || "Not Implemented"; //TODO implement when the requirement is known
    this.system = code?.system || "Not Implemented"; //TODO implement when the requirement is known
    this.conceptName = procedure["code"]?.["text"] || procedure["code"]?.["coding"]?.["display"];
  }
}
