import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "source_datasets", schema: "hat" },
    {
      created_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      sd_info: { notNull: true, type: "jsonb" },
      source_study_id: {
        notNull: true,
        type: "uuid",
      },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
    }
  );

  pgm.addConstraint(
    { name: "source_datasets", schema: "hat" },
    "pk_source_datasets_id",
    {
      primaryKey: "id",
    }
  );

  pgm.addConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_source_datasets_source_study_id",
    {
      foreignKeys: {
        columns: "source_study_id",
        references: { name: "source_studies", schema: "hat" },
      },
    }
  );

  pgm.createTrigger(
    { name: "source_datasets", schema: "hat" },
    "update_updated_at",
    {
      function: { name: "update_updated_at_column", schema: "hat" },
      level: "ROW",
      operation: "UPDATE",
      when: "BEFORE",
    }
  );
};
