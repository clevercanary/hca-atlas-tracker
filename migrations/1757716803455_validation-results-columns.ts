import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Add additional columns required to hold dataset validator results
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      dataset_info: {
        comment: "Metadata from the file",
        notNull: false,
        type: "jsonb",
      },
      validation_info: {
        comment:
          "Metadata of the batch job and SNS message used in validating the file",
        notNull: false,
        type: "jsonb",
      },
    },
  );
}
