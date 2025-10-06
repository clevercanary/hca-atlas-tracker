import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      is_archived: {
        default: false,
        notNull: true,
        type: "boolean",
      },
    }
  );
}
