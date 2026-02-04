import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "entry_sheet_validations", schema: "hat" },
    {
      entry_sheet_id: {
        notNull: true,
        type: "text",
        unique: true,
      },
      entry_sheet_title: {
        type: "text",
      },
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        primaryKey: true,
        type: "uuid",
      },
      last_synced: {
        notNull: true,
        type: "timestamp",
      },
      last_updated: {
        type: "jsonb",
      },
      source_study_id: {
        notNull: true,
        references: { name: "source_studies", schema: "hat" },
        type: "uuid",
      },
      validation_report: {
        notNull: true,
        type: "jsonb",
      },
      validation_summary: {
        type: "jsonb",
      },
    },
  );
};
