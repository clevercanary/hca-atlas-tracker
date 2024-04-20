import { HCAAtlasTrackerDBSourceDatasetInfo } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import pg from "pg";
import { getPoolConfig } from "../app/utils/__mocks__/pg-app-connect-config";
import {
  INITIAL_TEST_ATLASES,
  INITIAL_TEST_SOURCE_DATASETS,
  INITIAL_TEST_USERS,
} from "./constants";
import { makeTestAtlasOverview } from "./utils";

const { Pool } = pg;

export default async function setup(): Promise<void> {
  const pool = new Pool(getPoolConfig());
  for (const user of INITIAL_TEST_USERS) {
    await pool.query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [user.disabled.toString(), user.email, user.name, user.role]
    );
  }

  for (const dataset of INITIAL_TEST_SOURCE_DATASETS) {
    const sdInfo: HCAAtlasTrackerDBSourceDatasetInfo = {
      cellxgeneCollectionId: null,
      hcaProjectId: null,
      publication: dataset.publication,
      publicationStatus: dataset.publicationStatus,
    };
    await pool.query(
      "INSERT INTO hat.source_datasets (doi, id, sd_info) VALUES ($1, $2, $3)",
      [dataset.doi, dataset.id, JSON.stringify(sdInfo)]
    );
  }

  for (const atlas of INITIAL_TEST_ATLASES) {
    const overview = makeTestAtlasOverview(atlas);
    await pool.query(
      "INSERT INTO hat.atlases (id, overview, source_datasets, status) VALUES ($1, $2, $3, $4)",
      [
        atlas.id,
        JSON.stringify(overview),
        JSON.stringify(atlas.sourceDatasets || []),
        atlas.status,
      ]
    );
  }

  pool.end();
}
