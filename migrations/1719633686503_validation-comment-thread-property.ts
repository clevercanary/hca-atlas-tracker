import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "validations", schema: "hat" },
    {
      comment_thread_id: {
        type: "uuid",
      },
    },
  );
}
