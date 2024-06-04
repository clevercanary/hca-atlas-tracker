import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    UPDATE hat.validations
    SET
      validation_id = regexp_replace(validation_id, '^SOURCE_DATASET_(?=(?:HCA_PROJECT_HAS_PRIMARY_DATA|IN_CAP|IN_CELLXGENE|IN_HCA_DATA_REPOSITORY|TITLE_MATCHES_HCA_DATA_REPOSITORY)$)', 'SOURCE_STUDY_'),
      validation_info =
        CASE WHEN validation_info->>'entityType' = 'SOURCE_DATASET' THEN
          validation_info || jsonb_build_object(
            'description', COALESCE(NULLIF(validation_info->>'description', 'Ingest source dataset.'), 'Ingest source study.'),
            'entityType', 'SOURCE_STUDY'
          )
        ELSE validation_info END
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    UPDATE hat.validations
    SET
      validation_id = regexp_replace(validation_id, '^SOURCE_STUDY_(?=(?:HCA_PROJECT_HAS_PRIMARY_DATA|IN_CAP|IN_CELLXGENE|IN_HCA_DATA_REPOSITORY|TITLE_MATCHES_HCA_DATA_REPOSITORY)$)', 'SOURCE_DATASET_'),
      validation_info =
        CASE WHEN validation_info->>'entityType' = 'SOURCE_STUDY' THEN
          validation_info || jsonb_build_object(
            'description', COALESCE(NULLIF(validation_info->>'description', 'Ingest source study.'), 'Ingest source dataset.'),
            'entityType', 'SOURCE_DATASET'
          )
        ELSE validation_info END
  `);
}
