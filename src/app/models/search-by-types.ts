// Helper enum for the patient search filters selection
export enum SearchByType {
  FHIR_ID = "FHIR ID",
  NAME_AND_DOB = "Name and DoB",
  IDENTIFIER = "Identifier"
}
export const searchByTypes : SearchByType[] = [
  SearchByType.IDENTIFIER, SearchByType.NAME_AND_DOB, SearchByType.FHIR_ID
]
