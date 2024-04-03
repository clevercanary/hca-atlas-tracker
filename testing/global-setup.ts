import pg from "pg";
import { HCAAtlasTrackerDBAtlasOverview } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getPoolConfig } from "../app/utils/__mocks__/pg-connect-config";
import { INITIAL_TEST_ATLASES, INITIAL_TEST_USERS } from "./constants";

const { Pool } = pg;

export default async function setup(): Promise<void> {
  const pool = new Pool(getPoolConfig());
  for (const user of INITIAL_TEST_USERS) {
    await pool.query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [user.disabled.toString(), user.email, user.name, user.role]
    );
  }
  for (const atlas of INITIAL_TEST_ATLASES) {
    const overview: HCAAtlasTrackerDBAtlasOverview = {
      focus: atlas.focus,
      network: atlas.network,
      version: atlas.version,
    };
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
