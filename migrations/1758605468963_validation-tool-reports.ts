import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      validation_reports: {
        notNull: false,
        type: "jsonb",
      },
      validation_summary: {
        notNull: false,
        type: "jsonb",
      },
    }
  );
}
