import {FhirBaseResource} from "./fhir/fhir.base.resource";

export enum StructuredResultType {
  OBSERVATION = 'Observation',
  MEDICATION_REQUEST = 'MedicationRequest',
  CONDITION = 'Condition',
  ENCOUNTER = 'Encounter',
  PROCEDURE = 'Procedure'
}

export enum System {
  LOINC = 'http://loinc.org',
  ICD_10 = 'http://hl7.org/fhir/sid/icd-10-cm',
  SNOMED = 'http://snomed.info/sct'
}

export class SimpleStructuredEvidence {
  [key: string]: any;

  getCode(evidence, preferredSystems? : string[]) {
    if (!preferredSystems) return evidence?.code?.coding?.[0] || undefined;
    let coding = evidence?.code?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(evidence, preferredSystems.splice(1, preferredSystems.length));
    else return coding;
  }

  getReasonCode(evidence, preferredSystems? : string[]) {
    if (!preferredSystems) return evidence?.reasonCode?.[0]?.coding?.[0] || undefined;
    let coding = evidence?.reasonCode?.[0]?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(evidence, preferredSystems.splice(1, preferredSystems.length));
    else return coding;
  }

}

export class SimpleObservation extends SimpleStructuredEvidence {
  date: string;
  code: string;
  system: string;
  conceptName: string;
  value: string;

  constructor(observation: FhirBaseResource){
    super();
    this.date = observation?.["effectiveDateTime"] || observation?.["effectivePeriod"]?.["start"] || undefined;
    const code = super.getCode(observation,  [System.LOINC]);
    this.code = code?.code;
    this.system = code?.system;
    this.conceptName = observation?.["code"]?.["text"] || code?.display;
    this.value = "Temp Value"; //TODO presently not specified
  }
}

export class SimpleCondition extends SimpleStructuredEvidence {
  date: string;
  code: string;
  system: string;
  conceptName: string;
  onset: string;
  abatement: string;
  constructor(condition: FhirBaseResource){
    super();
    this.date = condition["recordedDate"];
    const code = super.getCode(condition, [System.ICD_10, System.SNOMED]);
    this.code = code?.code;
    this.system = code?.system;
    this.conceptName = condition?.["code"]?.["text"] || code?.display;
    this.onset = condition["onsetDateTime"] || condition["onsetPeriod"]?.["start"];
    this.abatement = condition["abatementDateTime"];
  }
}

export class SimpleProcedure extends SimpleStructuredEvidence {
  constructor(observation: FhirBaseResource){
    super();
    return null;
  }
}


export class SimpleEncounter extends SimpleStructuredEvidence {
  periodStart: string;
  periodEnd: string;
  encounterType: string;
  reasonCode: string;
  reasonSystem: string;
  reasonConceptName: string;
  constructor(encounter: FhirBaseResource){
    super();
    this.periodStart = encounter["period"]?.["start"];
    this.periodEnd = encounter["period"]?.["end"];
    this.encounterType = encounter["type"]?.[0]?.["text"] || encounter["type"]?.[0]?.["coding"] ?.[0]?.display
    const reasonCode = super.getReasonCode(encounter, [System.ICD_10, System.SNOMED]);
    this.reasonCode = reasonCode?.code;
    this.reasonSystem = reasonCode?.system;
    this.reasonConceptName = reasonCode?.display;
  }
}

export class SimpleMedicationRequest  extends SimpleStructuredEvidence {
  constructor(medicationRequest: FhirBaseResource){
    super()
    // TODO: Implement the Constructor
    return null;
  }
}
