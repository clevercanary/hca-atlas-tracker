import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumn(
    { name: "source_datasets", schema: "hat" },
    {
      publication_status: {
        default: "Unspecified",
        notNull: true,
        type: "string",
      },
    }
  );
}
