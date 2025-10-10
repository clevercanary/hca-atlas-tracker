import { NotFoundError } from "./api-handler";

/**
 * Throw an error if the given query rows do not include all expected IDs.
 * @param rows - Array of query result rows containing `id` fields.
 * @param expectedIds - IDs that are expected to be present.
 * @param entityPluralName - Plural name of the entity type, to use in the potential error message.
 */
export function confirmQueryRowsContainIds(
  rows: { id: string }[],
  expectedIds: string[],
  entityPluralName: string
): void {
  const presentIds = new Set(rows.map((d) => d.id));
  const missingIds = expectedIds.filter((id) => !presentIds.has(id));

  if (missingIds.length)
    throw new NotFoundError(
      `No ${entityPluralName} exist with ID(s): ${missingIds.join(", ")}`
    );
}
