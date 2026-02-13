import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // 1. Create the concepts table
  pgm.createTable(
    { name: "concepts", schema: "hat" },
    {
      atlas_short_name: {
        notNull: true,
        type: "text",
      },
      base_filename: {
        notNull: true,
        type: "text",
      },
      created_at: {
        default: pgm.func("NOW()"),
        type: "timestamp",
      },
      file_type: {
        notNull: true,
        type: "text",
      },
      generation: {
        notNull: true,
        type: "integer",
      },
      id: {
        default: pgm.func("gen_random_uuid()"),
        notNull: true,
        primaryKey: true,
        type: "uuid",
      },
      network: {
        notNull: true,
        type: "text",
      },
    },
  );

  // 2. Create unique index for concept identity
  pgm.createIndex(
    { name: "concepts", schema: "hat" },
    ["atlas_short_name", "network", "generation", "base_filename", "file_type"],
    {
      name: "idx_concepts_unique",
      unique: true,
    },
  );

  // 3. Add concept_id column to files table (nullable for now)
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      concept_id: {
        type: "uuid",
      },
    },
  );

  // 4. Data migration: Create concepts from existing source datasets.
  //    Use each SD's `id` as the concept's `id` so the FK will be valid.
  //    Extract (atlas_short_name, network, generation, base_filename) from the S3 key of the latest file.
  pgm.sql(`
    INSERT INTO hat.concepts (id, atlas_short_name, network, generation, base_filename, file_type)
    SELECT DISTINCT ON (sd.id)
      sd.id,
      -- Extract short name: second path segment with version suffix removed
      -- e.g., 'gut-v1' -> 'gut', 'retina-v1-1' -> 'retina'
      regexp_replace(split_part(f.key, '/', 2), '-v\\d+(-\\d+)*$', ''),
      -- Extract network: first path segment
      split_part(f.key, '/', 1),
      -- Extract generation: first number after -v in second path segment
      (regexp_match(split_part(f.key, '/', 2), '-v(\\d+)'))[1]::integer,
      -- Strip version suffix from filename to get base_filename
      regexp_replace(
        substring(f.key from '[^/]+$'),
        '-r\\d+(-wip-\\d+)?\\.h5ad$',
        '.h5ad'
      ),
      'source_dataset'
    FROM hat.source_datasets sd
    JOIN hat.files f ON f.id = sd.file_id
    WHERE sd.is_latest
  `);

  // 5. Data migration: Create concepts from existing component atlases (integrated objects).
  pgm.sql(`
    INSERT INTO hat.concepts (id, atlas_short_name, network, generation, base_filename, file_type)
    SELECT DISTINCT ON (ca.id)
      ca.id,
      regexp_replace(split_part(f.key, '/', 2), '-v\\d+(-\\d+)*$', ''),
      split_part(f.key, '/', 1),
      (regexp_match(split_part(f.key, '/', 2), '-v(\\d+)'))[1]::integer,
      regexp_replace(
        substring(f.key from '[^/]+$'),
        '-r\\d+(-wip-\\d+)?\\.h5ad$',
        '.h5ad'
      ),
      'integrated_object'
    FROM hat.component_atlases ca
    JOIN hat.files f ON f.id = ca.file_id
    WHERE ca.is_latest
  `);

  // 6. Populate concept_id on files linked to source datasets
  pgm.sql(`
    UPDATE hat.files f
    SET concept_id = sd.id
    FROM hat.source_datasets sd
    WHERE sd.file_id = f.id
  `);

  // 7. Populate concept_id on files linked to component atlases
  pgm.sql(`
    UPDATE hat.files f
    SET concept_id = ca.id
    FROM hat.component_atlases ca
    WHERE ca.file_id = f.id
  `);

  // 8. Add FK: source_datasets.id -> concepts.id
  pgm.addConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_sd_concept",
    {
      foreignKeys: {
        columns: "id",
        references: { name: "concepts", schema: "hat" },
      },
    },
  );

  // 9. Add FK: component_atlases.id -> concepts.id
  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "fk_io_concept",
    {
      foreignKeys: {
        columns: "id",
        references: { name: "concepts", schema: "hat" },
      },
    },
  );

  // 10. Add FK: files.concept_id -> concepts.id
  pgm.addConstraint({ name: "files", schema: "hat" }, "fk_files_concept", {
    foreignKeys: {
      columns: "concept_id",
      references: { name: "concepts", schema: "hat" },
    },
  });
}

export function down(pgm: MigrationBuilder): void {
  // Drop FK: files.concept_id -> concepts.id
  pgm.dropConstraint({ name: "files", schema: "hat" }, "fk_files_concept");

  // Drop FK: component_atlases.id -> concepts.id
  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "fk_io_concept",
  );

  // Drop FK: source_datasets.id -> concepts.id
  pgm.dropConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_sd_concept",
  );

  // Drop concept_id column from files
  pgm.dropColumns({ name: "files", schema: "hat" }, ["concept_id"]);

  // Drop concepts table (cascade drops index)
  pgm.dropTable({ name: "concepts", schema: "hat" });
}
