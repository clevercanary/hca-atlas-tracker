import { NonEmpty } from "./entities";

/**
 * Returns true if the value is a non-empty string.
 * @param value - Value.
 * @returns value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is NonEmpty {
  return typeof value === "string" && value.trim() !== "";
}
