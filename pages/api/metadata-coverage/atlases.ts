import { metadataCoverageTiersSchema } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  AtlasMetadataCoverageRollup,
  FILE_TYPE,
  MetadataCoverageReportTier,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import { getAtlasCompletenessRollup } from "../../../app/services/metadata-coverage";
import {
  getMappedOptionalParam,
  handler,
  method,
  paramParserForOneOf,
  parseListParam,
  registeredUser,
} from "../../../app/utils/api-handler";

const ALLOWED_SOURCES = [
  FILE_TYPE.INTEGRATED_OBJECT,
  FILE_TYPE.SOURCE_DATASET,
] as const;

const DEFAULT_SOURCE = FILE_TYPE.SOURCE_DATASET;

const DEFAULT_TIERS: MetadataCoverageReportTier[] = ["required"];

/**
 * API route to get the per-atlas, per-entity-class metadata completeness
 * rollup that backs the corpus-wide metadata completeness heatmap.
 */
export default handler(method(METHOD.GET), registeredUser, async (req, res) => {
  const source =
    getMappedOptionalParam(
      req,
      "source",
      paramParserForOneOf(ALLOWED_SOURCES),
    ) ?? DEFAULT_SOURCE;

  const tiers = await metadataCoverageTiersSchema.validate(
    getMappedOptionalParam(req, "required", parseListParam) ?? DEFAULT_TIERS,
  );

  const rollup: AtlasMetadataCoverageRollup = {
    atlases: await getAtlasCompletenessRollup(source, tiers),
  };
  res.status(200).json(rollup);
});
