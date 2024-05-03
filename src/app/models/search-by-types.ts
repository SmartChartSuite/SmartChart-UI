// Helper enum for the patient search filters selection
export enum searchByType {
  FHIR_ID = "FHIR ID",
  NAME_AND_DOB = "Name and DoB",
  IDENTIFIER = "Identifier"
}
export const searchByTypes : searchByType[] = [
  searchByType.IDENTIFIER, searchByType.NAME_AND_DOB, searchByType.FHIR_ID
]
