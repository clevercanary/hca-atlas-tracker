import { getCellxGeneIdByDoi } from "app/services/cellxgene";
import { ValidationError } from "yup";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBPublishedSourceDatasetInfo,
  HCAAtlasTrackerDBSourceDataset,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newSourceDatasetSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import { FormResponseErrors } from "../../../../../app/hooks/useForm/common/entities";
import { getProjectIdByDoi } from "../../../../../app/services/hca-projects";
import {
  getPoolClient,
  handleGetRefreshValue,
  handler,
  handleValidation,
  method,
  query,
  role,
} from "../../../../../app/utils/api-handler";
import { getCrossrefPublicationInfo } from "../../../../../app/utils/crossref/crossref";
import { normalizeDoi } from "../../../../../app/utils/doi";

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

    const [newData, newDataFailed] = await handleValidation(
      res,
      newSourceDatasetSchema,
      req.body
    );
    if (newDataFailed) return;

    // Get DOI-related information

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

    const dois = [
      ...(publication?.preprintOfDoi ? [publication.preprintOfDoi] : []),
      doi,
      ...(publication?.hasPreprintDoi ? [publication.hasPreprintDoi] : []),
    ];

    const [hcaProjectId, hcaProjectIdFailed] = handleGetRefreshValue(res, () =>
      getProjectIdByDoi(dois)
    );
    if (hcaProjectIdFailed) return;

    const [cellxgeneCollectionId, cellxgeneIdFailed] = handleGetRefreshValue(
      res,
      () => getCellxGeneIdByDoi(dois)
    );
    if (cellxgeneIdFailed) return;

    // Create new source dataset

    const newInfo: HCAAtlasTrackerDBPublishedSourceDatasetInfo = {
      cellxgeneCollectionId,
      doiStatus: publication ? DOI_STATUS.OK : DOI_STATUS.DOI_NOT_ON_CROSSREF,
      hcaProjectId,
      publication,
      unpublishedInfo: null,
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
