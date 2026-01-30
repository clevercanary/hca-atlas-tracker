import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "users", schema: "hat" },
    {
      role_associated_resource_ids: {
        default: "{}",
        notNull: true,
        type: "uuid[]",
      },
    },
  );
  pgm.alterColumn(
    { name: "users", schema: "hat" },
    "role_associated_resource_ids",
    {
      notNull: true,
      type: "uuid[]",
    },
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropColumn(
    { name: "users", schema: "hat" },
    "role_associated_resource_ids",
  );
}
