import {StructuredEvidenceDTO} from "./structured-evidence-dto";
import {FhirBaseResource} from "../fhir/fhir.base.resource";
import {System} from "./system";

export class EncounterDTO extends StructuredEvidenceDTO {
  periodStart: string; //TODO: verify the criteria with the rest of the team.
  periodEnd: string;
  encounterType: string;
  reasonCode: string;
  reasonSystem: string;
  reasonConceptName: string;
  constructor(encounter: FhirBaseResource){
    super();
    console.log(encounter); //TODO: Remove console.log
    this.periodStart = encounter["period"]?.["start"];
    this.periodEnd = encounter["period"]?.["end"];
    this.encounterType = encounter["type"]?.[0]?.["text"] || encounter["type"]?.[0]?.["coding"] ?.[0]?.display
    const reasonCode = super.getCode(encounter, 'reasonCode', [System.ICD_10, System.SNOMED]);
    this.reasonCode = reasonCode?.code;
    this.reasonSystem =  super.getSystemFromEnum(reasonCode?.system)
    this.reasonConceptName = reasonCode?.text || reasonCode[0]?.coding?.display;
  }
}
