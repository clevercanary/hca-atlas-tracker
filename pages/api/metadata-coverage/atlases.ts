import { metadataCoverageTiersSchema } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  AtlasMetadataCoverageRollup,
  FILE_TYPE,
  MetadataCoverageReportTier,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import { getAtlasCompletenessRollup } from "../../../app/services/metadata-coverage";
import {
  handleMappedOptionalParam,
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
  const sourceResult = handleMappedOptionalParam(
    req,
    res,
    "source",
    paramParserForOneOf(ALLOWED_SOURCES),
  );
  if (sourceResult.responseSent) return;
  const source = sourceResult.param ?? DEFAULT_SOURCE;

  const tiersResult = handleMappedOptionalParam(
    req,
    res,
    "required",
    parseListParam,
  );
  if (tiersResult.responseSent) return;
  const tiers = await metadataCoverageTiersSchema.validate(
    tiersResult.param ?? DEFAULT_TIERS,
  );

  const rollup: AtlasMetadataCoverageRollup = {
    atlases: await getAtlasCompletenessRollup(source, tiers),
  };
  res.status(200).json(rollup);
});
