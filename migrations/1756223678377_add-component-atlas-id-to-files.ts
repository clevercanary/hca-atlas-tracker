import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Add component_atlas_id column to files table
  pgm.addColumn(
    { name: "files", schema: "hat" },
    {
      component_atlas_id: {
        comment: "FK to component_atlases.id - set for integrated_object files",
        notNull: false,
        type: "uuid",
      },
    }
  );

  // Add foreign key constraint for component atlas relationship
  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
    {
      foreignKeys: {
        columns: "component_atlas_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        references: { name: "component_atlases", schema: "hat" },
      },
    }
  );

  // Add index for component atlas queries
  pgm.createIndex({ name: "files", schema: "hat" }, ["component_atlas_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Remove index (if exists)
  pgm.dropIndex({ name: "files", schema: "hat" }, ["component_atlas_id"], {
    ifExists: true,
  });

  // Remove foreign key constraint (if exists)
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
    { ifExists: true }
  );

  // Remove column (if exists)
  pgm.dropColumn({ name: "files", schema: "hat" }, "component_atlas_id", {
    ifExists: true,
  });
}
