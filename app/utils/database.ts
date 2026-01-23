import { NotFoundError } from "./api-handler";

/**
 * Throw an error if the given query rows do not include all expected version IDs.
 * @param rows - Array of query result rows containing `version_id` fields.
 * @param expectedIds - IDs that are expected to be present.
 * @param entityPluralName - Plural name of the entity type, to use in the potential error message.
 * @param errorType - Error constructor to use if any version IDs are missing.
 */
export function confirmQueryRowsContainVersionIds(
  rows: { version_id: string }[],
  expectedIds: string[],
  entityPluralName: string,
  errorType: new (message: string) => Error = NotFoundError
): void {
  const presentIds = new Set(rows.map((d) => d.version_id));
  const missingIds = expectedIds.filter((id) => !presentIds.has(id));

  if (missingIds.length)
    throw new errorType(
      `No appropriate ${entityPluralName} found with version ID(s): ${missingIds.join(
        ", "
      )}`
    );
}

/**
 * Throw an error if the given query rows do not include all expected IDs.
 * @param rows - Array of query result rows containing `id` fields.
 * @param expectedIds - IDs that are expected to be present.
 * @param entityPluralName - Plural name of the entity type, to use in the potential error message.
 */
export function confirmQueryRowsContainIds(
  rows: { id: string }[],
  expectedIds: string[],
  entityPluralName: string,
): void {
  const presentIds = new Set(rows.map((d) => d.id));
  const missingIds = expectedIds.filter((id) => !presentIds.has(id));

  if (missingIds.length)
    throw new NotFoundError(
      `No ${entityPluralName} exist with ID(s): ${missingIds.join(", ")}`,
    );
}
