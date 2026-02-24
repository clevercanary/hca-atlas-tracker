import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "atlases", schema: "hat" },
    {
      published_at: {
        type: "timestamp",
      },
    },
  );
  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      published_at: {
        type: "timestamp",
      },
    },
  );
  pgm.addColumns(
    { name: "source_datasets", schema: "hat" },
    {
      published_at: {
        type: "timestamp",
      },
    },
  );
}
