import { ValidationError } from "yup";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
  PUBLICATION_STATUS,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  newSourceDatasetSchema,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../app/common/entities";
import {
  getPoolClient,
  handler,
  method,
  query,
  role,
} from "../../../../../app/utils/api-handler";
import {
  getCrossrefPublicationInfo,
  normalizeDoi,
} from "../../../../../app/utils/publications";

/**
 * API route for creating a source dataset. Source dataset information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role("CONTENT_ADMIN"), // Since the route is restricted to content admins, there are no additional permissions checks
  async (req, res) => {
    const atlasId = req.query.atlasId as string;

    const atlasExists = (
      await query("SELECT EXISTS(SELECT 1 FROM hat.atlases WHERE id=$1)", [
        atlasId,
      ])
    ).rows[0].exists;
    if (!atlasExists) {
      res.status(404).end();
      return;
    }

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
    const publication = await getCrossrefPublicationInfo(doi);
    const newInfo: HCAAtlasTrackerDBSourceDatasetInfo = {
      publication,
      publicationStatus: publication
        ? PUBLICATION_STATUS.OK
        : PUBLICATION_STATUS.DOI_NOT_ON_CROSSREF,
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
      // Update the atlas's list of source datasets
      await client.query(
        "UPDATE hat.atlases SET source_datasets=source_datasets||$1 WHERE id=$2",
        [JSON.stringify([newDataset.id]), atlasId]
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
