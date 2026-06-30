/**
 * Generic interface for objects that have a value and display representation.
 * Useful for dropdown options, filters, and other UI elements that need
 * to map internal values to user-friendly display strings.
 */
export interface ValueDisplay<T = string> {
  display: string;
  value: T;
}
