import {FhirBaseResource} from "./fhir/fhir.base.resource";

export enum StructuredResultType {
  OBSERVATION = 'Observation',
  MEDICATION_REQUEST = 'MedicationRequest',
  CONDITION = 'Condition',
  ENCOUNTER = 'Encounter',
  PROCEDURE = 'Procedure'
}

export class SimpleStructuredEvidence {
  [key: string]: any;

  getCode(observation, preferredSystems? : string[]) {
    if (!preferredSystems) return observation?.code?.coding?.[0] || undefined;
    let coding = observation?.code?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(observation, preferredSystems.splice(1, preferredSystems.length));
  }

}

export class SimpleObservation extends SimpleStructuredEvidence {
  date: string;
  code: string;
  system: string;
  conceptName: string;
  value: string;

  constructor(evidence: FhirBaseResource){
    super();
    this.date = evidence?.["effectiveDateTime"] || evidence?.["effectivePeriod"]?.["start"] || undefined;
    const code = super.getCode(evidence);
    this.code = code?.code;
    this.system = code?.system;
    this.conceptName = evidence?.["code"]?.["text"] || code?.display;
    this.value = "Temp Value";
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
    const code = super.getCode(condition);
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



export class SimpleEncounter {
  constructor(observation: FhirBaseResource){
    // TODO: Implement the Constructor
    return null;
  }
}

export class SimpleMedicationRequest {
  constructor(observation: FhirBaseResource){
    // TODO: Implement the Constructor
    return null;
  }
}
