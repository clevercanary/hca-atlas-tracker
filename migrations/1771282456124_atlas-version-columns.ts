import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "atlases", schema: "hat" },
    {
      generation: {
        default: 1,
        notNull: true,
        type: "integer",
      },
      revision: {
        default: 0,
        notNull: true,
        type: "integer",
      },
    },
  );

  // Set generation as any leading digits from the version, and revision as any trailing digits following a period, defaulting to 1 and 0 respectively
  // Also remove `version`
  pgm.sql(
    `
      UPDATE hat.atlases
      SET
        generation = COALESCE(substring(overview->>'version' from '^(\\d+)')::int, 1),
        revision = COALESCE(substring(overview->>'version' from '\\.(\\d+)$')::int, 0),
        overview = overview - 'version'
    `,
  );
}

export function down(pgm: MigrationBuilder): void {
  // Restore `version` based on generation and revision
  pgm.sql(
    "UPDATE hat.atlases SET overview = overview || jsonb_build_object('version', generation || '.' || revision)",
  );

  pgm.dropColumns({ name: "atlases", schema: "hat" }, [
    "generation",
    "revision",
  ]);
}
