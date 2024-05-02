import {
  ATLAS_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  ROLE,
} from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbSourceDatasetToApiSourceDataset } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../app/common/entities";
import { query } from "../../../../app/services/database";
import {
  getUserRoleFromAuthorization,
  handler,
  method,
} from "../../../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const id = req.query.atlasId as string;
  const {
    rows: [atlas],
  } = await query<Pick<HCAAtlasTrackerDBAtlas, "source_datasets" | "status">>(
    "SELECT source_datasets, status FROM hat.atlases WHERE id=$1",
    [id]
  );
  if (!atlas) {
    res.status(404).end();
    return;
  }
  const role = await getUserRoleFromAuthorization(req.headers.authorization);
  if (atlas.status !== ATLAS_STATUS.PUBLIC && role !== ROLE.CONTENT_ADMIN) {
    res.status(role === null ? 401 : 403).end();
    return;
  }
  const sourceDatasets =
    atlas.source_datasets.length === 0
      ? []
      : (
          await query<HCAAtlasTrackerDBSourceDataset>(
            "SELECT * FROM hat.source_datasets WHERE id=ANY($1)",
            [atlas.source_datasets]
          )
        ).rows;
  res.json(sourceDatasets.map(dbSourceDatasetToApiSourceDataset));
});
