import { endPgPool } from "@/app/services/database";
import { getPoolConfig } from "@/app/utils/pg-app-connect-config";
import { resetDatabase } from "@/testing/db-utils";
import fs from "fs";
import migrate from "node-pg-migrate";
import { type MigrationDirection } from "node-pg-migrate/dist/types";
import pg from "pg";

jest.mock("@/app/services/hca-projects");
jest.mock("@/app/services/cellxgene");
jest.mock("@/app/utils/pg-app-connect-config");

const MIGRATION_NAME = "1794864321000_timestamps-to-timestamptz";

/**
 * Time zone of the migrating session -- deliberately not UTC, so that the test fails if the migration's values depend
 * on the session's time zone.
 */
const SESSION_TIME_ZONE = "America/Los_Angeles";

interface TestRow {
  id?: string;
  insert: (client: pg.Client) => Promise<string>;
  table: string;
  values: Record<string, string>;
}

/**
 * Rows to insert before the migration, with their naive timestamp values (UTC wall-clock time).
 */
const TEST_ROWS: TestRow[] = [
  {
    insert: async (client) =>
      (
        await client.query<{ id: string }>(
          `
            INSERT INTO hat.atlases (overview, source_studies, status, short_name_slug, created_at, published_at, target_completion, updated_at)
            VALUES ('{}', '[]', 'IN_PROGRESS', 'test', $1, $2, $3, $4)
            RETURNING id
          `,
          getValues("atlases"),
        )
      ).rows[0].id,
    table: "atlases",
    values: {
      created_at: "2024-05-20 06:51:49.973",
      published_at: "2026-04-10 03:06:14.665",
      target_completion: "2024-09-30 23:59:59.999",
      updated_at: "2026-11-03 11:25:10.543",
    },
  },
  {
    insert: async (client): Promise<string> => {
      const sourceStudyId = (
        await client.query<{ id: string }>(
          "INSERT INTO hat.source_studies (study_info) VALUES ('{}') RETURNING id",
        )
      ).rows[0].id;
      return (
        await client.query<{ id: string }>(
          `
            INSERT INTO hat.entry_sheet_validations (entry_sheet_id, source_study_id, validation_report, validation_summary, last_synced)
            VALUES ('test-entry-sheet', $1, '[]', '{}', $2)
            RETURNING id
          `,
          [sourceStudyId, ...getValues("entry_sheet_validations")],
        )
      ).rows[0].id;
    },
    table: "entry_sheet_validations",
    values: {
      last_synced: "2026-01-26 13:08:25.435",
    },
  },
  {
    insert: async (client) =>
      (
        await client.query<{ id: string }>(
          `
            INSERT INTO hat.users (disabled, email, full_name, role, last_login)
            VALUES (false, 'test@example.com', 'Test', 'STAKEHOLDER', $1)
            RETURNING id
          `,
          getValues("users"),
        )
      ).rows[0].id,
    table: "users",
    values: {
      last_login: "2026-11-12 22:29:45.655",
    },
  },
  {
    insert: async (client) =>
      (
        await client.query<{ id: string }>(
          `
            INSERT INTO hat.validations (entity_id, validation_id, validation_info, created_at, resolved_at, target_completion, updated_at)
            VALUES ('test-entity', 'test-validation', '{}', $1, $2, $3, $4)
            RETURNING id
          `,
          getValues("validations"),
        )
      ).rows[0].id,
    table: "validations",
    values: {
      created_at: "2024-06-03 19:15:42.248",
      resolved_at: "2024-09-26 17:05:10.087",
      target_completion: "2024-12-31 23:59:59.999",
      updated_at: "2025-02-01 08:18:44.387",
    },
  },
];

// A standalone client, rather than one from the app pool, so that the pool can be ended independently of it
let client: pg.Client;

beforeAll(async () => {
  await resetDatabase(false);
  client = new pg.Client(getPoolConfig());
  await client.connect();
  await client.query("SELECT set_config('TimeZone', $1, false)", [
    SESSION_TIME_ZONE,
  ]);

  // Go back to just before the migration, and insert naive values
  await runMigrations("down", getMigrationCountFromThisOne());
  await expectColumnTypes("timestamp without time zone");
  for (const row of TEST_ROWS) row.id = await row.insert(client);
});

afterAll(async () => {
  // Leave the database fully migrated
  await runMigrations("up", Infinity);
  await client.end();
  await endPgPool();
});

describe(MIGRATION_NAME, () => {
  it("converts existing naive values to timestamptz as UTC instants, from a non-UTC session", async () => {
    await runMigrations("up", Infinity);
    await expectColumnTypes("timestamp with time zone");
    for (const { id, table, values } of TEST_ROWS) {
      for (const [column, naiveValue] of Object.entries(values)) {
        const value = await getColumnValue<Date>(table, column, id);
        expect([table, column, value.toISOString()]).toEqual([
          table,
          column,
          naiveValue.replace(" ", "T") + "Z",
        ]);
      }
    }
  });

  it("restores the original naive values on down, from a non-UTC session", async () => {
    await runMigrations("down", getMigrationCountFromThisOne());
    await expectColumnTypes("timestamp without time zone");
    for (const { id, table, values } of TEST_ROWS) {
      for (const [column, naiveValue] of Object.entries(values)) {
        const value = await getColumnValue<string>(table, column, id, true);
        expect([table, column, value]).toEqual([table, column, naiveValue]);
      }
    }
  });
});

/**
 * Expect every timestamp column in the `hat` schema, other than the migrations table's, to have the given type.
 * @param dataType - Expected data type.
 */
async function expectColumnTypes(dataType: string): Promise<void> {
  const { rows } = await client.query<{ data_type: string }>(
    `
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'hat' AND table_name != 'pgmigrations' AND data_type LIKE 'timestamp%'
    `,
  );
  expect(rows).toHaveLength(25);
  for (const { data_type } of rows) expect(data_type).toEqual(dataType);
}

/**
 * Get a column's value from a test row.
 * @param table - Table name.
 * @param column - Column name.
 * @param id - Row ID.
 * @param asText - Whether to get the value as Postgres's text representation, rather than as parsed by node-pg.
 * @returns value.
 */
async function getColumnValue<T>(
  table: string,
  column: string,
  id: string | undefined,
  asText = false,
): Promise<T> {
  // eslint-disable-next-line sonarjs/sql-queries -- the identifiers come from this file's own constants
  const { rows } = await client.query<{ value: T }>(
    `SELECT ${column}${asText ? "::text" : ""} AS value FROM hat.${table} WHERE id = $1`,
    [id],
  );
  return rows[0].value;
}

/**
 * Get the number of migrations from this one to the latest, i.e. the number to run down to undo this one.
 * @returns migration count.
 */
function getMigrationCountFromThisOne(): number {
  return fs
    .readdirSync("migrations")
    .filter((file) => file.replace(/\.ts$/, "") >= MIGRATION_NAME).length;
}

/**
 * Get the test values for the given table, in alphabetical column order.
 * @param table - Table name.
 * @returns values.
 */
function getValues(table: string): string[] {
  const row = TEST_ROWS.find((r) => r.table === table);
  if (!row) throw new Error(`No test row for table ${table}`);
  return Object.keys(row.values)
    .sort()
    .map((column) => row.values[column]);
}

async function runMigrations(
  direction: MigrationDirection,
  count: number,
): Promise<void> {
  await migrate({
    count,
    dbClient: client,
    dir: "migrations",
    direction,
    log: () => undefined,
    migrationsTable: "pgmigrations",
    // node-pg-migrate doesn't release its advisory lock on a `dbClient` it was passed, so the pooled connection used by
    // `resetDatabase` still holds it
    noLock: true,
    schema: "hat",
  });
}
