import { type MigrationBuilder } from "node-pg-migrate";

/**
 * Timestamp columns to convert, keyed by table.
 */
const TIMESTAMP_COLUMNS: [string, string[]][] = [
  [
    "atlases",
    ["created_at", "published_at", "target_completion", "updated_at"],
  ],
  ["comments", ["created_at", "updated_at"]],
  ["component_atlases", ["created_at", "published_at", "updated_at"]],
  ["concepts", ["created_at", "updated_at"]],
  ["entry_sheet_validations", ["last_synced"]],
  ["files", ["created_at", "integrity_checked_at", "updated_at"]],
  ["source_datasets", ["created_at", "published_at", "updated_at"]],
  ["source_studies", ["created_at", "updated_at"]],
  ["users", ["last_login"]],
  [
    "validations",
    ["created_at", "resolved_at", "target_completion", "updated_at"],
  ],
];

/**
 * Builds one ALTER TABLE statement per table, covering all of the table's timestamp columns.
 * @param type - Type to convert the columns to.
 * @param lastLoginDefault - New default for `users.last_login`.
 * @returns SQL statements.
 */
function buildStatements(type: string, lastLoginDefault: string): string[] {
  return TIMESTAMP_COLUMNS.map(([table, columns]) => {
    const clauses = columns.map(
      (column) => `ALTER COLUMN ${column} TYPE ${type}`,
    );
    if (table === "users") {
      clauses.push(`ALTER COLUMN last_login SET DEFAULT ${lastLoginDefault}`);
    }
    return `ALTER TABLE hat.${table} ${clauses.join(", ")}`;
  });
}

// Existing naive values are interpreted as UTC, in both directions, by pinning the session time zone for the
// migration's transaction (node-pg-migrate runs each migration in its own transaction, so `SET LOCAL` doesn't outlast
// it). UTC is the zone the deployed databases and Node processes run in, so it's the zone the values were written in --
// see https://github.com/clevercanary/hca-atlas-tracker/issues/1558. With the session in UTC, Postgres converts between
// `timestamp` and `timestamptz` without rewriting the tables.
//
// `entry_sheet_validations.last_synced` is always UTC, regardless of the database or Node time zone: it's written via
// `jsonb_to_recordset` from a `JSON.stringify`-ed `Date`, and the cast to `timestamp` discarded the ISO string's `Z`
// offset. The other columns were written in the database session's time zone (`CURRENT_TIMESTAMP` defaults) or the
// Node process's time zone (`Date` parameters). To migrate a database where those zones aren't UTC (e.g. a local
// development database), pin that zone instead, and convert `last_synced` explicitly from UTC with
// `ALTER COLUMN last_synced TYPE timestamptz USING last_synced AT TIME ZONE 'UTC'` (and the same `USING` clause with
// `TYPE timestamp` in `down`).

const PIN_UTC = "SET LOCAL TimeZone = 'UTC'";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(PIN_UTC);
  for (const statement of buildStatements(
    "timestamptz",
    "'1970-01-01 00:00:00+00'::timestamptz",
  )) {
    pgm.sql(statement);
  }
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(PIN_UTC);
  for (const statement of buildStatements(
    "timestamp",
    "'1970-01-01 00:00:00'::timestamp",
  )) {
    pgm.sql(statement);
  }
}
