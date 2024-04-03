import { ValidationError } from "yup";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  newSourceDatasetSchema,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  getPoolClient,
  handler,
  method,
  role,
} from "../../../../../app/utils/api-handler";
import {
  getPublicationInfo,
  normalizeDoi,
} from "../../../../../app/utils/publications";

/**
 * API route for creating a source dataset. Source dataset information is provided as a JSON body.
 */
export default handler(
  method("POST"),
  role("CONTENT_ADMIN"), // Since the route is restricted to content admins, there are no additional permissions checks
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    let newData: NewSourceDatasetData;
    try {
      newData = await newSourceDatasetSchema.validate(req.body);
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).json({ message: e.message });
        return;
      } else {
        throw e;
      }
    }
    const doi = normalizeDoi(newData.doi);
    const newInfo: HCAAtlasTrackerDBSourceDatasetInfo = {
      publication: await getPublicationInfo(doi),
    };
    const client = await getPoolClient();
    try {
      await client.query("BEGIN");
      // Add the new source dataset
      const newDataset = (
        await client.query<HCAAtlasTrackerDBSourceDataset>(
          "INSERT INTO hat.source_datasets (doi, sd_info) VALUES ($1, $2) RETURNING *",
          [doi, JSON.stringify(newInfo)]
        )
      ).rows[0];
      // Get the atlas's existing list of source datasets
      const atlasDatasets = (
        await client.query<HCAAtlasTrackerDBAtlas>(
          "SELECT source_datasets FROM hat.atlases WHERE id=$1",
          [atlasId]
        )
      ).rows[0]?.source_datasets;
      if (!atlasDatasets) {
        res.status(404).end();
        return;
      }
      // Update the atlas's list of source datasets
      const newAtlasDatasets = atlasDatasets.concat([newDataset.id]);
      await client.query(
        "UPDATE hat.atlases SET source_datasets=$1 WHERE id=$2",
        [JSON.stringify(newAtlasDatasets), atlasId]
      );
      await client.query("COMMIT");
      res.status(201).json(newDataset);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
);
