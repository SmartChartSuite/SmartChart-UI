import {Period} from "./period";
import {CodeableConcept} from "./codeable-concept";
import {FhirType} from "../fhir.type";
import {Code, Uri} from "../fhir.primitive";
import {FhirElement} from "../fhir.element";
import {Reference} from "./reference";

export class Identifier extends FhirType {
  use?: Code;
  _use?: FhirElement
  type?: CodeableConcept;
  system?: Uri;
  _system?: FhirElement;
  value?: string;
  _value?: FhirElement;
  period?: Period;
  assigner?: Reference;
}
