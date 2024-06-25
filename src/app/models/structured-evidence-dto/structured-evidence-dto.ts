import {System} from "./system";

export class StructuredEvidenceDTO {
  [key: string]: any;

  getCode(evidence, property: string, preferredSystems? : string[]) {
    if (!preferredSystems) return evidence?.[property]?.coding?.[0] || undefined;
    let coding = evidence?.[property]?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(evidence, property, preferredSystems.splice(1, preferredSystems.length));
    else return coding;
  }

  getSystemFromEnum(system: System): string  {
    if(system == System.LOINC) return "Loinc";
    else if(system == System.ICD_10) return "ICD-10";
    else if(system == System.SNOMED) return "SNOMED CT";
    else if(system == System.RX_NORM) return "RxNorm";
    else if(system == System.CPT) return "CPT";
    else if(system) return system; //Unknown systems passed. We need to render it to the user
    else return "";
  }

}
