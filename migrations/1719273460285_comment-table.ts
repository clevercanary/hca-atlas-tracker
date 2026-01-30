import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "comments", schema: "hat" },
    {
      created_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      created_by: {
        notNull: true,
        type: "integer",
      },
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      text: {
        notNull: true,
        type: "text",
      },
      thread_id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      updated_by: {
        notNull: true,
        type: "integer",
      },
    },
  );

  pgm.addConstraint({ name: "comments", schema: "hat" }, "pk_comments_id", {
    primaryKey: "id",
  });

  pgm.addConstraint(
    { name: "comments", schema: "hat" },
    "fk_comments_created_by_user_id",
    {
      foreignKeys: {
        columns: "created_by",
        references: { name: "users", schema: "hat" },
      },
    },
  );

  pgm.addConstraint(
    { name: "comments", schema: "hat" },
    "fk_comments_updated_by_user_id",
    {
      foreignKeys: {
        columns: "updated_by",
        references: { name: "users", schema: "hat" },
      },
    },
  );

  pgm.createTrigger({ name: "comments", schema: "hat" }, "update_updated_at", {
    function: { name: "update_updated_at_column", schema: "hat" },
    level: "ROW",
    operation: "UPDATE",
    when: "BEFORE",
  });
};
