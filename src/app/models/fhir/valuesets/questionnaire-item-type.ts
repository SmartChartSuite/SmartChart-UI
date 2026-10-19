// https://hl7.org/fhir/R4/valueset-item-type.html

export enum QuestionnaireItemType {
  group = "group",
  display = "display",
  question = "question",
  boolean = "boolean",
  decimal = "decimal",
  integer = "integer",
  date = "date",
  dateTime = "dateTime",
  time = "time",
  string = "string",
  text = "text",
  url = "url",
  choice = "choice",
  openChoice = "open-choice",
  attachment = "attachment",
  reference = "reference",
  quantity = "quantity"
}
