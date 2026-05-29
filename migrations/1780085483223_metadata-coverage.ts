import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      metadata_coverage: {
        type: "jsonb",
      },
    },
  );
}
