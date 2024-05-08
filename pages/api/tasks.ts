import { ROLE_GROUP } from "../../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerValidationRecord,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { getPoolClient } from "../../app/services/database";
import { getSourceDatasetValidationResults } from "../../app/services/validations";
import { handler, method, role } from "../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    // TODO return validations from database instead
    const client = await getPoolClient();
    try {
      const sourceDatasets = (
        await client.query<HCAAtlasTrackerDBSourceDataset>(
          "SELECT * FROM hat.source_datasets"
        )
      ).rows;
      const validations: HCAAtlasTrackerValidationRecord[] = [];
      for (const sourceDataset of sourceDatasets) {
        for (const validationResult of await getSourceDatasetValidationResults(
          sourceDataset,
          client
        )) {
          validations.push(validationResult);
        }
      }
      res.json(validations);
    } finally {
      client.release();
    }
  }
);
