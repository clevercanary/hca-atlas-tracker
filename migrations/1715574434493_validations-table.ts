import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "validations", schema: "hat" },
    {
      atlas_ids: {
        default: "{}",
        notNull: true,
        type: "uuid[]",
      },
      created_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      entity_id: { notNull: true, type: "text" },
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
        unique: true,
      },
      resolved_at: {
        default: null,
        type: "timestamp",
      },
      target_completion: {
        default: null,
        type: "timestamp",
      },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      validation_id: { notNull: true, type: "text" },
      validation_info: { notNull: true, type: "jsonb" },
    }
  );

  pgm.addConstraint(
    { name: "validations", schema: "hat" },
    "pk_validations_id",
    {
      primaryKey: ["entity_id", "validation_id"],
    }
  );

  pgm.createTrigger(
    { name: "validations", schema: "hat" },
    "update_updated_at",
    {
      function: { name: "update_updated_at_column", schema: "hat" },
      level: "ROW",
      operation: "UPDATE",
      when: "BEFORE",
    }
  );
};
