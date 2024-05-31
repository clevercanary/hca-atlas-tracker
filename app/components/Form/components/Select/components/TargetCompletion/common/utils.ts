import { TARGET_COMPLETION_NULL } from "./constants";

/**
 * Returns target completion form field value mapped to the expected schema value.
 * @param targetCompletion - Target completion.
 * @returns target completion payload.
 */
export function mapTargetCompletion(
  targetCompletion: string | null
): string | null {
  return targetCompletion === TARGET_COMPLETION_NULL ? null : targetCompletion;
}
