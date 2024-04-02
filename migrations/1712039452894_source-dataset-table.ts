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
      doi: { type: "text", unique: true },
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      sd_info: { notNull: true, type: "jsonb" },
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
