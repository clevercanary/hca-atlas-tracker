import { METADATA_COVERAGE_TIERS } from "../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  AtlasMetadataCoverageRollup,
  FILE_TYPE,
  MetadataCoverageTier,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import { getAtlasCompletenessRollup } from "../../../app/services/metadata-coverage";
import { InvalidOperationError } from "../../../app/utils/api-errors";
import {
  handler,
  method,
  registeredUser,
} from "../../../app/utils/api-handler";

/**
 * API route to get the per-atlas, per-entity-class metadata completeness
 * rollup that backs the corpus-wide metadata completeness heatmap.
 */
export default handler(method(METHOD.GET), registeredUser, async (req, res) => {
  const source = parseSource(req.query.source);
  const tiers = parseTiers(req.query.required);
  const rollup: AtlasMetadataCoverageRollup = {
    atlases: await getAtlasCompletenessRollup(source, tiers),
  };
  res.status(200).json(rollup);
});

/**
 * Parse the `source` query parameter, defaulting to source datasets.
 * @param value - Raw query parameter value.
 * @returns file type contributing coverage.
 * @throws InvalidOperationError - When the value isn't a recognized source.
 */
function parseSource(
  value: string | string[] | undefined,
): FILE_TYPE.INTEGRATED_OBJECT | FILE_TYPE.SOURCE_DATASET {
  if (value === undefined) return FILE_TYPE.SOURCE_DATASET;
  if (
    value === FILE_TYPE.SOURCE_DATASET ||
    value === FILE_TYPE.INTEGRATED_OBJECT
  )
    return value;
  throw new InvalidOperationError(
    `source parameter must be "${FILE_TYPE.SOURCE_DATASET}" or "${FILE_TYPE.INTEGRATED_OBJECT}"`,
  );
}

/**
 * Parse the comma-separated `required` query parameter, defaulting to the
 * required tier.
 * @param value - Raw query parameter value.
 * @returns deduplicated list of requirement tiers.
 * @throws InvalidOperationError - When the value contains an unrecognized tier.
 */
function parseTiers(
  value: string | string[] | undefined,
): MetadataCoverageTier[] {
  const raw = value === undefined ? "required" : value;
  if (typeof raw !== "string")
    throw new InvalidOperationError("required parameter must be a string");
  const rawTiers = raw
    .split(",")
    .map((tier) => tier.trim())
    .filter(Boolean);
  if (rawTiers.length === 0)
    throw new InvalidOperationError("required parameter must not be empty");
  const tiers = new Set<MetadataCoverageTier>();
  for (const tier of rawTiers) {
    if (!isMetadataCoverageTier(tier))
      throw new InvalidOperationError(
        `required parameter values must be among: ${METADATA_COVERAGE_TIERS.join(", ")}`,
      );
    tiers.add(tier);
  }
  return Array.from(tiers);
}

/**
 * Type guard for requirement tier values.
 * @param value - Value to check.
 * @returns whether the value is a requirement tier.
 */
function isMetadataCoverageTier(value: string): value is MetadataCoverageTier {
  return (METADATA_COVERAGE_TIERS as readonly string[]).includes(value);
}
