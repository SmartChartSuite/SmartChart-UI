import {FhirBaseResource} from "./fhir/fhir.base.resource";

export enum StructuredResultType {
  OBSERVATION = 'Observation',
  MEDICATION_REQUEST = 'MedicationRequest',
  CONDITION = 'Conditions',
  ENCOUNTER = 'Encounters',
  PROCEDURE = 'Procedure'
}

export class SimpleObservation {
  date: string;
  code: string;
  system: string;
  conceptName: string;
  value: string;

  constructor(observation: FhirBaseResource){
    this.date = observation?.["effectiveDateTime"] || observation?.["effectivePeriod"]?.["start"] || undefined;
    const code = this.getCode(observation);
    this.code = code?.code;
    this.system = code?.system;
    this.conceptName = observation?.["code"]?.["text"] || code?.display;
    this.value = this.getObservationValue(observation);
  }

  getCode(observation, preferredSystems? : string[]) {
    if (!preferredSystems) return observation?.code?.coding?.[0] || undefined;
    let coding = observation?.code?.coding?.find(coding => coding?.["system"] === preferredSystems[0]);
    if (!coding) return this.getCode(observation, preferredSystems.splice(1, preferredSystems.length));
  }

  private getObservationValue(observation: FhirBaseResource) {
    //TODO This function needs implementation
    return "Placeholder Value";
  }
}

export class SimpleProcedure {
  constructor(observation: FhirBaseResource){
    // TODO: Implement the Constructor
    return null;
  }
}

export class SimpleCondition {
  constructor(observation: FhirBaseResource){
    // TODO: Implement the Constructor
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
