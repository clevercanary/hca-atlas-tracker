import { type MigrationBuilder } from "node-pg-migrate";

const COMMENTS = { name: "comments", schema: "hat" };
const COMPONENT_ATLASES = { name: "component_atlases", schema: "hat" };
const ENTRY_SHEET_VALIDATIONS = {
  name: "entry_sheet_validations",
  schema: "hat",
};
const FILES = { name: "files", schema: "hat" };
const SOURCE_DATASETS = { name: "source_datasets", schema: "hat" };
const SOURCE_STUDIES = { name: "source_studies", schema: "hat" };
const VALIDATIONS = { name: "validations", schema: "hat" };
const ATLASES = { name: "atlases", schema: "hat" };

/**
 * Add indexes for the access patterns identified in the schema/query review (#1458).
 * `down` is omitted so that node-pg-migrate infers it by reversing these operations.
 * @param pgm - Migration builder instance.
 */
export function up(pgm: MigrationBuilder): void {
  // Unindexed foreign keys, all joined or filtered on in hot read paths, and all
  // requiring a full scan of the referencing table to enforce the constraint on
  // parent deletes/key updates.

  // Joined `ON f.id = d.file_id` in every source dataset read, and filtered on
  // directly by `getSourceDatasetForAtlasFile`.
  pgm.createIndex(SOURCE_DATASETS, ["file_id"]);

  // Joined `ON f.id = ca.file_id` in every component atlas read, and filtered on
  // directly by `getComponentAtlasForAtlasFile`.
  pgm.createIndex(COMPONENT_ATLASES, ["file_id"]);

  // Source dataset and component atlas `id` is the per-concept identity shared
  // across versions, not the primary key (which is `version_id`). It backs the
  // by-ID route resolvers `getSourceDatasetVersionsPresentOnAtlas` and
  // `getComponentAtlasVersionForAtlas`, the `mark*AsNotLatest` updates on the S3
  // ingest path, and the `JOIN hat.concepts con ON con.id = d.id` in list reads.
  pgm.createIndex(SOURCE_DATASETS, ["id"]);
  pgm.createIndex(COMPONENT_ATLASES, ["id"]);

  // `markPreviousVersionsAsNotLatest` and `getLatestNotificationInfo` both filter
  // on `concept_id` on every S3 notification.
  pgm.createIndex(FILES, ["concept_id"]);

  // `source_dataset_counts` groups by it; source study replacement/unlinking
  // updates filter on it.
  pgm.createIndex(SOURCE_DATASETS, ["source_study_id"]);

  // Filtered with `= $n` / `= ANY(...)` throughout the entry sheet services.
  pgm.createIndex(ENTRY_SHEET_VALIDATIONS, ["source_study_id"]);

  // `WHERE thread_id = $1` throughout the comment services, including a
  // correlated `MIN(created_at)` subquery.
  pgm.createIndex(COMMENTS, ["thread_id"]);

  // GIN indexes for the array/jsonb containment relationships. These can't use
  // B-trees, and the joins below currently scan the whole referencing table.

  // `JOIN ... ON v.atlas_ids @> ARRAY[a.id]` in `updateTaskCounts`.
  pgm.createIndex(VALIDATIONS, ["atlas_ids"], { method: "gin" });

  // `a.source_studies` is jsonb queried with both `?` and `@>`, so the default
  // `jsonb_ops` opclass is required (`jsonb_path_ops` doesn't support `?`).
  pgm.createIndex(ATLASES, ["source_studies"], { method: "gin" });

  // `WHERE ... source_datasets @> ARRAY[$1]` in `updateSourceDatasetVersionInComponentAtlases`.
  pgm.createIndex(COMPONENT_ATLASES, ["source_datasets"], { method: "gin" });

  // `getExistingStudyId` and `getSourceStudiesByDois` match a DOI against `doi`
  // OR either of these jsonb paths; the unique index on `doi` can't be used
  // while the other two branches of the OR are unindexed.
  pgm.createIndex(
    SOURCE_STUDIES,
    ["(study_info->'publication'->>'preprintOfDoi')"],
    { name: "source_studies_preprint_of_doi_index" },
  );
  pgm.createIndex(
    SOURCE_STUDIES,
    ["(study_info->'publication'->>'hasPreprintDoi')"],
    { name: "source_studies_has_preprint_doi_index" },
  );
}
