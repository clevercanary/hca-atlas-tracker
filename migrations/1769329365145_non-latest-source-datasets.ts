import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Create source datasets for non-latest file versions
  pgm.sql(`
    INSERT INTO hat.source_datasets (id, version_id, sd_info, reprocessed_status, source_study_id, is_latest, file_id, wip_number, created_at, updated_at)
    SELECT
      sd.id,
      gen_random_uuid() AS version_id,
      sd.sd_info,
      sd.reprocessed_status,
      sd.source_study_id,
      false AS is_latest,
      f.id AS file_id,
      sd.wip_number - (ROW_NUMBER() OVER (PARTITION BY f.source_dataset_id ORDER BY f.created_at DESC)) AS wip_number,
      f.created_at,
      sd.updated_at
    FROM hat.files f
    JOIN hat.source_datasets sd ON sd.version_id = f.source_dataset_id
    WHERE f.source_dataset_id IS NOT NULL
      AND f.is_latest = false
  `);

  // Drop the `source_dataset_id` column and its index
  pgm.dropIndex({ name: "files", schema: "hat" }, "source_dataset_id");
  pgm.dropColumn({ name: "files", schema: "hat" }, "source_dataset_id");
}

export function down(pgm: MigrationBuilder): void {
  // Re-add the columns to files table
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      source_dataset_id: {
        type: "uuid",
      },
    },
  );

  // Re-create the index
  pgm.createIndex({ name: "files", schema: "hat" }, ["source_dataset_id"]);

  // Populate source_dataset_id from source_datasets
  pgm.sql(`
    UPDATE hat.files f
    SET source_dataset_id = sd.id
    FROM hat.source_datasets sd
    WHERE f.id = sd.file_id
  `);

  // Delete non-latest source datasets (keeping only the original ones)
  pgm.sql(`
    DELETE FROM hat.source_datasets
    WHERE is_latest = false
  `);
}
