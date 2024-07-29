import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../../fhir/fhir.base.resource";
import {System} from "./system";
import {PatientSummary} from "../../patient-summary";

export class ObservationDTO extends StructuredEvidenceDTO {
  dateAgeAt: string;
  code: string;
  system: string;
  conceptName: string;
  value: string;

  constructor(observation: FhirBaseResource, patientSummary: PatientSummary){
    super();
    console.log(observation); //TODO: Remove console.log
    const effectiveDateTime = observation?.["effectiveDateTime"] || observation?.["effectivePeriod"]?.["start"] || undefined;
    this.dateAgeAt = super.getDateAgeAsStr(effectiveDateTime,patientSummary.birthDate); //TODO: verify requirements
    const code = super.getCode(observation, 'code', [System.LOINC]);
    this.code = code?.code;
    this.system  = super.getSystemFromEnum(code?.system);
    this.conceptName = observation?.["code"]?.["text"] || code?.display;
    this.value = this.getValue(observation)
  }

  getValue(observation): string {
    if(observation.valueQuantity?.value && observation.valueQuantity?.unit){
      return `${observation?.valueQuantity?.value} ${observation?.valueQuantity?.unit}`
    }
    else if (observation.valueString) {
      return observation.valueString;
    }
    else if (observation.valueCodeableConcept) {
      return observation.valueCodeableConcept?.text || observation.valueCodeableConcept?.coding?.[0]?.display;
    }
    else return '';
  }

}
