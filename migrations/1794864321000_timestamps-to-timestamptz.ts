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
 * Columns whose naive values hold UTC wall-clock time, rather than wall-clock time in the database session's or Node
 * process's time zone, and so are converted explicitly from UTC.
 *
 * `entry_sheet_validations.last_synced` is written via `jsonb_to_recordset` from a `JSON.stringify`-ed `Date`, and so
 * has received an ISO string whose `Z` offset was discarded by the cast to `timestamp`.
 */
const UTC_COLUMNS = new Set(["last_synced"]);

/**
 * Builds one ALTER TABLE statement per table, so that each table is rewritten only once.
 * @param type - Type to convert the columns to.
 * @param lastLoginDefault - New default for `users.last_login`.
 * @returns SQL statements.
 */
function buildStatements(type: string, lastLoginDefault: string): string[] {
  return TIMESTAMP_COLUMNS.map(([table, columns]) => {
    const clauses = columns.map(
      (column) =>
        `ALTER COLUMN ${column} TYPE ${type}` +
        (UTC_COLUMNS.has(column) ? ` USING ${column} AT TIME ZONE 'UTC'` : ""),
    );
    if (table === "users") {
      clauses.push(`ALTER COLUMN last_login SET DEFAULT ${lastLoginDefault}`);
    }
    return `ALTER TABLE hat.${table} ${clauses.join(", ")}`;
  });
}

// Except for `UTC_COLUMNS`, existing values are interpreted using the migrating session's time zone (no explicit
// `USING ... AT TIME ZONE`). This matches how the values were written, provided the migration runs with the same time
// zone as the app's database sessions and Node process -- see https://github.com/clevercanary/hca-atlas-tracker/issues/1558.

export function up(pgm: MigrationBuilder): void {
  for (const statement of buildStatements(
    "timestamptz",
    "'1970-01-01 00:00:00+00'::timestamptz",
  )) {
    pgm.sql(statement);
  }
}

export function down(pgm: MigrationBuilder): void {
  for (const statement of buildStatements(
    "timestamp",
    "'1970-01-01 00:00:00'::timestamp",
  )) {
    pgm.sql(statement);
  }
}
