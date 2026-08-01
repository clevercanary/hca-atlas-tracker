import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.dropColumn({ name: "files", schema: "hat" }, ["source_study_id"]);
}

export function down(pgm: MigrationBuilder): void {
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      source_study_id: {
        notNull: false,
        type: "uuid",
      },
    },
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_study_id",
    {
      foreignKeys: {
        columns: "source_study_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        references: { name: "source_studies", schema: "hat" },
        referencesConstraintName: "pk_source_studies_id",
      },
    },
  );
}
