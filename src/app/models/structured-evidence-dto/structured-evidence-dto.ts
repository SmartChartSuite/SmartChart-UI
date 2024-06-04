import {System} from "./system";

export class StructuredEvidenceDTO {
  [key: string]: any;

  getCode(evidence, preferredSystems? : string[]) {
    if (!preferredSystems) return evidence?.code?.coding?.[0] || undefined;
    let coding = evidence?.code?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(evidence, preferredSystems.splice(1, preferredSystems.length));
    else return coding;
  }
  //TODO :  Find a way to integrate this function with the function above (getCode). We may be able to implement only one function when we know the requirements
  getReasonCode(evidence, preferredSystems? : string[]) {
    if (!preferredSystems) return evidence?.reasonCode?.[0]?.coding?.[0] || undefined;
    let coding = evidence?.reasonCode?.[0]?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(evidence, preferredSystems.splice(1, preferredSystems.length));
    else return coding;
  }
  getSystemFromEnum(system: System){
    if(system == System.LOINC) return "Loinc";
    else if(system == System.ICD_10) return "ICD-10";
    else if(system == System.SNOMED) return "SNOMED CT";
    else if(system) return system; //We don't know what system it was passed, but we know that a system was passed, and we want to return it
    else return "";
  }

}
