import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../../fhir/fhir.base.resource";
import {System} from "./system";
import {PatientSummary} from "../../patient-summary";

export class MedicationRequestDTO extends StructuredEvidenceDTO {
  code: string;
  system: string;
  conceptName: string;
  // dose: string;  Temporary removed per https://jira.gtri.gatech.edu/browse/IHSS-142
  // frequency: string;  Temporary removed per https://jira.gtri.gatech.edu/browse/IHSS-142
  dateAgeAt: string;
  dosage: string;
  constructor(medicationRequest: FhirBaseResource, patientSummary: PatientSummary){
    super();
    const dateAuthored = medicationRequest["authoredOn"];
    this.dateAgeAt = super.getDateAgeAsStr(dateAuthored, patientSummary.birthDate); //TODO: verify requirements
    const code = super.getCode(medicationRequest, 'medicationCodeableConcept', [System.RX_NORM])
    this.code = code?.code
    this.system = super.getSystemFromEnum(code?.system);
    this.conceptName = medicationRequest["medicationCodeableConcept"]?.["text"]
      || medicationRequest["medicationCodeableConcept"]?.["coding"]?.[0]?.["display"];
    // this.dose = ""; //TODO implement when the requirement is known. Temporary removed per https://jira.gtri.gatech.edu/browse/IHSS-142
    // this.frequency = ""; //TODO implement when the requirement is known. Temporary removed per https://jira.gtri.gatech.edu/browse/IHSS-142
    this.dosage = this.getDosage(medicationRequest); // See https://jira.gtri.gatech.edu/browse/IHSS-142 for requirements
  }

  // TODO replace with sortByDate pipe when the code is merged.
  public static sort(a, b){
    if (a["authoredOn"] && b["authoredOn"]) {
      return new Date(b["authoredOn"]).getTime() - new Date(a["authoredOn"]).getTime();
    }
    return 0;
  }

  private getDosage(medicationRequest): string {
    if(medicationRequest?.dosageInstruction?.[0]?.text){
      return medicationRequest?.dosageInstruction?.[0]?.text;
    }
    else if (medicationRequest?.dosageInstruction?.doseAndRate?.[0]?.doseQuantity?.value
      &&
      medicationRequest.dosageInstruction?.doseAndRate?.[0]?.doseQuantity?.unit
      &&
      medicationRequest.dosageInstruction?.[0]?.['timing']
    ){
      const result = `${medicationRequest?.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value}
      ${medicationRequest.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit};
      ${medicationRequest.dosageInstruction?.[0]?.['timing']}`;
      return result;
    }
    return '';
  }

}
