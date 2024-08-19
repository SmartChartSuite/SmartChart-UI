import {Coding} from "./coding";
import {FhirType} from "../fhir.type";
import {FhirElement} from "../fhir.element";

export class CodeableConcept extends FhirType {
  coding: Coding[];
  text?: string;
  _text?: FhirElement;
}
