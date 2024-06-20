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
    //TODO: Remove console.log
    console.log(medicationRequest); //TODO: Remove console.log
    this.dateAuthored = medicationRequest["authoredOn"];
    const code = super.getCode(medicationRequest);
    this.code = code?.code
    this.system = code?.system
    this.conceptName = medicationRequest["medicationCodeableConcept"]?.["text"]
      || medicationRequest["medicationCodeableConcept"]?.["coding"]?.[0]?.["display"];
    this.dose = ""; //TODO implement when the requirement is known
    this.frequency = ""; //TODO implement when the requirement is known
  }
}
