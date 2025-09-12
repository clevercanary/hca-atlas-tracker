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
      validation_sns_message_id: {
        comment:
          "SNS MessageId for deduplication of duplicate validation results SNS notifications",
        notNull: false,
        type: "varchar(255)",
        unique: true,
      },
    }
  );
}
