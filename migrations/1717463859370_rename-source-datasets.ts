import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameTable({ name: "source_datasets", schema: "hat" }, "source_studies");
  pgm.renameColumn(
    { name: "source_studies", schema: "hat" },
    "sd_info",
    "study_info",
  );
  pgm.renameConstraint(
    { name: "source_studies", schema: "hat" },
    "pk_source_datasets_id",
    "pk_source_studies_id",
  );

  pgm.renameColumn(
    { name: "atlases", schema: "hat" },
    "source_datasets",
    "source_studies",
  );
}

// Renaming a table doesn't work when the new name has a schema specified, so a separate down migration is required
export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.renameColumn(
    { name: "atlases", schema: "hat" },
    "source_studies",
    "source_datasets",
  );

  pgm.renameConstraint(
    { name: "source_studies", schema: "hat" },
    "pk_source_studies_id",
    "pk_source_datasets_id",
  );
  pgm.renameColumn(
    { name: "source_studies", schema: "hat" },
    "study_info",
    "sd_info",
  );
  pgm.renameTable({ name: "source_studies", schema: "hat" }, "source_datasets");
}
