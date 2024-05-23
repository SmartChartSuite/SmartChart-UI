import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../fhir/fhir.base.resource";

export class MedicationRequestDTO extends StructuredEvidenceDTO {
  dateAuthored: string;
  code: string;
  system: string;
  conceptName: string;
  dose: string;
  frequency: string;
  constructor(medicationRequest: FhirBaseResource){
    super();
    console.log(medicationRequest); //TODO: Remove console.log
    this.dateAuthored = medicationRequest["authoredOn"];
    const code = super.getCode(medicationRequest); //TODO implement when the requirement is known
    this.code = code?.code || "Not Implemented"; //TODO implement when the requirement is known
    this.system = code?.system || "Not Implemented"; //TODO implement when the requirement is known
    this.conceptName = medicationRequest["medicationCodeableConcept"]?.["text"]
      || medicationRequest["medicationCodeableConcept"]?.["coding"]?.[0]?.["display"]; //TODO verify with documentation, when the documentation is ready
    this.dose = "Not Implemented";
    this.frequency = "Not Implemented"; //TODO implement when the requirement is known
  }
}
