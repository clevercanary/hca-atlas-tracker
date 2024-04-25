import { getCellxGeneIdByDoi } from "app/services/cellxgene";
import { NextApiResponse } from "next";
import { ValidationError } from "yup";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetMinimumColumns,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  newSourceDatasetSchema,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
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

type HandledSourceDatasetInfo =
  | [HCAAtlasTrackerDBSourceDatasetMinimumColumns, false]
  | [null, true];

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

    const [newInfo, newInfoFailed] = newData.doi
      ? await handleGetPublishedInfo(res, newData)
      : await handleGetUnpublishedInfo(res, newData);
    if (newInfoFailed) return;

    const client = await getPoolClient();
    try {
      await client.query("BEGIN");
      // Add the new source dataset
      const newDataset = (
        await client.query<HCAAtlasTrackerDBSourceDataset>(
          "INSERT INTO hat.source_datasets (doi, sd_info) VALUES ($1, $2) RETURNING *",
          [newInfo.doi, JSON.stringify(newInfo.sd_info)]
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

async function handleGetPublishedInfo(
  res: NextApiResponse,
  data: NewSourceDatasetData
): Promise<HandledSourceDatasetInfo> {
  const doi = normalizeDoi(data.doi);

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
      return [null, true];
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
  if (hcaProjectIdFailed) return [null, true];

  const [cellxgeneCollectionId, cellxgeneIdFailed] = handleGetRefreshValue(
    res,
    () => getCellxGeneIdByDoi(dois)
  );
  if (cellxgeneIdFailed) return [null, true];

  return [
    {
      doi,
      sd_info: {
        cellxgeneCollectionId,
        doiStatus: publication ? DOI_STATUS.OK : DOI_STATUS.DOI_NOT_ON_CROSSREF,
        hcaProjectId,
        publication,
        unpublishedInfo: null,
      },
    },
    false,
  ];
}

async function handleGetUnpublishedInfo(
  res: NextApiResponse,
  data: NewSourceDatasetData
): Promise<HandledSourceDatasetInfo> {
  return [
    {
      doi: null,
      sd_info: {
        cellxgeneCollectionId: null,
        doiStatus: DOI_STATUS.NA,
        hcaProjectId: null,
        publication: null,
        unpublishedInfo: {
          author: data.author,
          contactEmail: data.contactEmail,
          title: data.title,
        },
      },
    },
    false,
  ];
}
