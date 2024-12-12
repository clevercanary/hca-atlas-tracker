import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumn(
    { name: "atlases", schema: "hat" },
    {
      source_datasets: {
        default: "{}",
        notNull: true,
        type: "uuid[]",
      },
    }
  );
}
