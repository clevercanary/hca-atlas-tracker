import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(
    { name: "atlases", schema: "hat" },
    {
      target_completion: {
        default: null,
        type: "timestamp",
      },
    }
  );
}
