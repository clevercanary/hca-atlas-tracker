import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      revision: {
        default: 1,
        notNull: true,
        type: "integer",
      },
    },
  );
  pgm.addColumns(
    { name: "source_datasets", schema: "hat" },
    {
      revision: {
        default: 1,
        notNull: true,
        type: "integer",
      },
    },
  );
}
