import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "component_atlases", schema: "hat" },
    {
      atlas_id: {
        notNull: true,
        type: "uuid",
      },
      component_info: { notNull: true, type: "jsonb" },
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
      source_datasets: { default: "{}", notNull: true, type: "uuid[]" },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
    }
  );

  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "pk_component_atlases_id",
    {
      primaryKey: "id",
    }
  );

  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "pk_component_atlases_atlas_id",
    {
      foreignKeys: {
        columns: "atlas_id",
        references: { name: "atlases", schema: "hat" },
      },
    }
  );

  pgm.createTrigger(
    { name: "component_atlases", schema: "hat" },
    "update_updated_at",
    {
      function: { name: "update_updated_at_column", schema: "hat" },
      level: "ROW",
      operation: "UPDATE",
      when: "BEFORE",
    }
  );
};
