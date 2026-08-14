import {FhirBaseResource} from "./fhir/fhir.base.resource";

export interface ItemInterface {
  linkId: string;           // Required FHIR property
  type?: string;            // QuestionnaireItemType
  text?: string;            // Question text
  value?: any;              // Custom property
  item?: ItemInterface[];   // Nested items
  answer?: any;             // Answer value
  answerOption?: string[];  // Answer options as strings (extracted from valueString)
  selected?: boolean;       // Custom property for UI state
  extension?: any[];        // FHIR extensions
  [key: string]: any;       // Allow additional dynamic properties
}

export class Item implements ItemInterface {
  linkId!: string;
  type?: string;
  text?: string;
  value?: any;
  item?: Item[];
  answer?: any;
  answerOption?: string[];
  selected?: boolean;
  extension?: any[];
  [key: string]: any;

  constructor(data: Partial<ItemInterface> = {}) {
    // Required property
    this.linkId = data.linkId || '';

    // Optional properties
    if (data.type !== undefined) this.type = data.type;
    if (data.text !== undefined) this.text = data.text;
    if (data.value !== undefined) this.value = data.value;
    if (data.answer !== undefined) this.answer = data.answer;
    if (data.selected !== undefined) this.selected = data.selected;
    if (data.extension !== undefined) this.extension = data.extension;

    // Extract answerOption valueStrings
    if (data.answerOption && Array.isArray(data.answerOption)) {
      this.answerOption = data.answerOption.map((option: any) => option?.valueString || '');
    }

    // Recursively initialize nested items
    if (data.item && Array.isArray(data.item)) {
      this.item = data.item.map(nestedItem => new Item(nestedItem));
    }

    // Copy any additional dynamic properties
    Object.keys(data).forEach(key => {
      if (!['linkId', 'type', 'text', 'value', 'item', 'answer', 'answerOption', 'selected', 'extension'].includes(key)) {
        this[key] = data[key];
      }
    });
  }
}

export class Questionnaire implements FhirBaseResource {
  resourceType: string;
  id?: string;
  meta?: any;
  implicitRules?: string;
  language?: string;
  title: string;
  item: Item[];
  [key: string]: any;

  constructor(questionnaireResource: FhirBaseResource){
    // Copy FHIR base properties
    this.resourceType = questionnaireResource.resourceType || 'Questionnaire';
    this.title = questionnaireResource['title'] || '';
    if (questionnaireResource.id) this.id = questionnaireResource.id;
    if (questionnaireResource.meta) this.meta = questionnaireResource.meta;
    if (questionnaireResource.implicitRules) this.implicitRules = questionnaireResource.implicitRules;
    if (questionnaireResource.language) this.language = questionnaireResource.language;

    // Initialize items
    if(!(questionnaireResource?.['item']?.length  > 0)){
      this.item = [];
      return;
    }
    this.item = questionnaireResource?.['item'].map((itemData: any) => new Item(itemData));

    // Copy any additional dynamic properties
    Object.keys(questionnaireResource).forEach(key => {
      if (!['resourceType', 'id', 'meta', 'implicitRules', 'language', 'title', 'item'].includes(key)) {
        this[key] = questionnaireResource[key];
      }
    });

    console.log(this.item);
  }
}
