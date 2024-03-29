import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "atlases", schema: "hat" },
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
      overview: { notNull: true, type: "jsonb" },
      source_datasets: { notNull: true, type: "jsonb" },
      status: { notNull: true, type: "varchar(50)" },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
    }
  );

  pgm.addConstraint({ name: "atlases", schema: "hat" }, "pk_atlases_id", {
    primaryKey: "id",
  });

  pgm.createFunction(
    { name: "update_updated_at_column", schema: "hat" },
    [],
    {
      language: "plpgsql",
      returns: "TRIGGER",
    },
    `
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
    `
  );

  pgm.createTrigger({ name: "atlases", schema: "hat" }, "update_updated_at", {
    function: { name: "update_updated_at_column", schema: "hat" },
    level: "ROW",
    operation: "UPDATE",
    when: "BEFORE",
  });
};
