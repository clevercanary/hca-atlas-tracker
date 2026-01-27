import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Drop the constraint on file source dataset ID, so that it can refer to the new `id` column
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id"
  );

  // Rename source dataset `id` to `version_id`, as we want `version_id` to be the primary key
  pgm.renameColumn(
    { name: "source_datasets", schema: "hat" },
    "id",
    "version_id"
  );

  // Add new source dataset columns needed for versioning
  pgm.addColumns(
    { name: "source_datasets", schema: "hat" },
    {
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      is_latest: {
        default: true,
        notNull: true,
        type: "boolean",
      },
      wip_number: {
        default: 1,
        notNull: true,
        type: "integer",
      },
    }
  );

  // For existing source datasets, we want `id` to be the same as the existing ID now stored in `version_id`,
  // to make sure references are straightforwardly kept intact
  pgm.sql("UPDATE hat.source_datasets SET id = version_id");

  // Set accurate WIP numbers
  pgm.sql(`
    WITH files_info AS (
      SELECT
        source_dataset_id,
        COUNT(*) AS file_count
      FROM hat.files
      WHERE source_dataset_id IS NOT NULL
      GROUP BY source_dataset_id
    )
    UPDATE hat.source_datasets sd
    SET wip_number = f.file_count
    FROM files_info AS f
    WHERE sd.version_id = f.source_dataset_id
  `);
}

export function down(pgm: MigrationBuilder): void {
  // Copy `id` to `version_id` before replacing `id` with `version_id`
  pgm.sql("UPDATE hat.source_datasets SET version_id = id");

  // Drop the new columns from source_datasets
  pgm.dropColumns({ name: "source_datasets", schema: "hat" }, [
    "id",
    "is_latest",
    "wip_number",
  ]);

  // Rename version_id back to id
  pgm.renameColumn(
    { name: "source_datasets", schema: "hat" },
    "version_id",
    "id"
  );

  // Re-add the foreign key constraint
  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id",
    {
      foreignKeys: {
        columns: "source_dataset_id",
        onUpdate: "CASCADE",
        references: { name: "source_datasets", schema: "hat" },
      },
    }
  );
}
