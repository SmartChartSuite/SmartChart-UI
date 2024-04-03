import {FhirBaseResource} from "./fhir.base.resource";
import {StartJobsPostResponseKeys} from "./start-jobs-post-response";

/**
 * Note: This is a simplified abstraction of the FHIR Parameters resource and not a full implementation.
 */
export class Parameters implements FhirBaseResource {
  resourceType: string = "Parameters";
  parameter: Parameter[] = [];

  addParameter(parameter: Parameter) {
    this.parameter.push(parameter)
  }

  static getValue(parametersResource: Parameters, key: string): string | FhirBaseResource {
    const keyParameter = parametersResource.parameter.find(parameter => parameter?.name === key);
    if (keyParameter !== undefined) {
      return this.findChoiceOfTypeValue(keyParameter);
    }
    else {
      throw new Error(`Key ${key} not found.`)
    }
  }
  private static findChoiceOfTypeValue(parameter: Parameter): any {
    const keys = Object.keys(parameter);
    let valueKey: string = "";
    if (keys.indexOf("resource") > -1) {
      valueKey = "resource";
    }
    else valueKey = keys.find(key => key.startsWith("value")) || "";
    // @ts-ignore
    return parameter[valueKey];
  }
}


export class Parameter {
  constructor(name: string, valueString: string) {
    this.name = name;
    this.valueString = valueString;
  }
  name: string;
  valueString: string
}
