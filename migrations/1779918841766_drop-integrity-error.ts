import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn({ name: "files", schema: "hat" }, "integrity_error");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn(
    { name: "files", schema: "hat" },
    {
      integrity_error: {
        comment: "Error message if integrity validation fails",
        type: "text",
      },
    },
  );
}
