import { type MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "users", schema: "hat" },
    {
      can_issue_api_tokens: {
        default: false,
        notNull: true,
        type: "boolean",
      },
    },
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropColumn({ name: "users", schema: "hat" }, "can_issue_api_tokens");
}
