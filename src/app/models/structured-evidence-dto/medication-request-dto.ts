import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../fhir/fhir.base.resource";
import {System} from "./system";
import {PatientSummary} from "../patient-summary";

export class MedicationRequestDTO extends StructuredEvidenceDTO {
  code: string;
  system: string;
  conceptName: string;
  dose: string;
  frequency: string;
  dateAgeAt: string;
  constructor(medicationRequest: FhirBaseResource, patientSummary: PatientSummary){
    super();
    console.log(medicationRequest); //TODO: Remove console.log
    const dateAuthored = medicationRequest["authoredOn"];
    this.dateAgeAt = super.getDateAgeAsStr(dateAuthored, patientSummary.birthDate); //TODO: verify requirements
    const code = super.getCode(medicationRequest, 'medicationCodeableConcept', [System.RX_NORM])
    this.code = code?.code
    this.system = super.getSystemFromEnum(code?.system);
    this.conceptName = medicationRequest["medicationCodeableConcept"]?.["text"]
      || medicationRequest["medicationCodeableConcept"]?.["coding"]?.[0]?.["display"];
    this.dose = ""; //TODO implement when the requirement is known
    this.frequency = ""; //TODO implement when the requirement is known
  }

  public static sort(a, b){
    if (a["authoredOn"] && b["authoredOn"]) {
      return new Date(b["authoredOn"]).getTime() - new Date(a["authoredOn"]).getTime();
    }
    return 0;
  }

}
