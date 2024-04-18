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
import { dbSourceDatasetToApiSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import { FormResponseErrors } from "../../../../../app/hooks/useForm/common/entities";
import {
  getPoolClient,
  handler,
  method,
  query,
  respondValidationError,
  role,
} from "../../../../../app/utils/api-handler";
import { getCrossrefPublicationInfo } from "../../../../../app/utils/crossref/crossref";
import { normalizeDoi } from "../../../../../app/utils/doi";
import {
  getProjectIdByDoi,
  ProjectsNotReadyError,
} from "../../../../../app/utils/hca-projects";

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
        respondValidationError(res, e);
        return;
      } else {
        throw e;
      }
    }

    const doi = normalizeDoi(newData.doi);
    let publication;
    try {
      publication = await getCrossrefPublicationInfo(doi);
    } catch (e) {
      if (e instanceof ValidationError) {
        const errors: FormResponseErrors = {
          errors: {
            doi: [`Crossref data doesn't fit: ${e.message}`],
          },
        };
        res.status(500).json(errors);
        return;
      }
      throw e;
    }
    let hcaProjectId;
    try {
      hcaProjectId = await getProjectIdByDoi(doi);
    } catch (e) {
      if (e instanceof ProjectsNotReadyError) {
        res
          .status(503)
          .appendHeader("Retry-After", "20")
          .json({ message: e.message });
        return;
      }
      throw e;
    }
    const newInfo: HCAAtlasTrackerDBSourceDatasetInfo = {
      hcaProjectId,
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
      res.status(201).json(dbSourceDatasetToApiSourceDataset(newDataset));
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
);
