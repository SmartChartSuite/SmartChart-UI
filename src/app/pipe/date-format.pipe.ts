/**
 * Transforms a string containing an ISO date to mm/dd/yyyy format
 *
 * @param value - The input string that may contain an ISO date
 * @returns The date in mm/dd/yyyy format if found, otherwise the original string
 */
export function dateFormat(value: string): string {
  if (!value) return value;

  // Regular expression to find date format with or without time and timezone
  // This matches ISO dates like 2024-03-01T00:00:00Z and similar formats
  const dateRegex = /(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2})?([.]\d+)?(Z|[+-]\d{2}:\d{2})?/;
  const match = value.match(dateRegex);

  if (!match) return value;

  try {
    // Extract the matched date string
    const datePart = match[1];
    const date = new Date(`${datePart}T00:00:00`);

    // Check if the date is valid
    if (isNaN(date.getTime())) return value;

    // Format to mm/dd/yyyy
    const year = date.getFullYear();
    // getMonth() is 0-based, so add 1 and pad with 0 if needed
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}/${day}/${year}`;
  } catch (error) {
    return value;
  }
}
