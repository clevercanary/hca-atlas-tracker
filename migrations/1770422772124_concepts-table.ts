import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Create concepts table
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
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
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

  // Create unique index on concepts
  pgm.createIndex(
    { name: "concepts", schema: "hat" },
    ["atlas_short_name", "network", "generation", "base_filename", "file_type"],
    {
      name: "idx_concepts_unique",
      unique: true,
    },
  );

  // Add concept_id column to files table
  pgm.addColumn(
    { name: "files", schema: "hat" },
    {
      concept_id: {
        references: { name: "concepts", schema: "hat" },
        type: "uuid",
      },
    },
  );

  // Populate concepts table from existing source_datasets
  // For each source dataset, extract metadata from associated file and create concept
  // Note: Using ANY() with array field is acceptable for one-time migration backfill
  // For production queries on large datasets, consider using unnest() or GIN indexes on array fields
  pgm.sql(`
    INSERT INTO hat.concepts (id, atlas_short_name, network, generation, base_filename, file_type)
    SELECT DISTINCT
      sd.id,
      a.overview->>'shortName' as atlas_short_name,
      a.overview->>'network' as network,
      CAST(SPLIT_PART(a.overview->>'version', '.', 1) AS INTEGER) as generation,
      REGEXP_REPLACE(
        SPLIT_PART(f.key, '/', 4),
        '-r\\d+(-wip-\\d+)?(?=\\.h5ad$)',
        ''
      ) as base_filename,
      'source_dataset' as file_type
    FROM hat.source_datasets sd
    JOIN hat.files f ON f.id = sd.file_id
    JOIN hat.atlases a ON sd.id = ANY(a.source_datasets)
  `);

  // Populate concepts table from existing component_atlases (integrated objects)
  // Note: Using ANY() with array field is acceptable for one-time migration backfill
  pgm.sql(`
    INSERT INTO hat.concepts (id, atlas_short_name, network, generation, base_filename, file_type)
    SELECT DISTINCT
      ca.id,
      a.overview->>'shortName' as atlas_short_name,
      a.overview->>'network' as network,
      CAST(SPLIT_PART(a.overview->>'version', '.', 1) AS INTEGER) as generation,
      REGEXP_REPLACE(
        SPLIT_PART(f.key, '/', 4),
        '-r\\d+(-wip-\\d+)?(?=\\.h5ad$)',
        ''
      ) as base_filename,
      'integrated_object' as file_type
    FROM hat.component_atlases ca
    JOIN hat.files f ON f.id = ca.file_id
    JOIN hat.atlases a ON ca.id = ANY(a.component_atlases)
    ON CONFLICT (atlas_short_name, network, generation, base_filename, file_type) DO NOTHING
  `);

  // Populate file.concept_id from source_datasets
  pgm.sql(`
    UPDATE hat.files f
    SET concept_id = sd.id
    FROM hat.source_datasets sd
    WHERE f.id = sd.file_id
  `);

  // Populate file.concept_id from component_atlases
  pgm.sql(`
    UPDATE hat.files f
    SET concept_id = ca.id
    FROM hat.component_atlases ca
    WHERE f.id = ca.file_id
      AND f.concept_id IS NULL
  `);

  // Add foreign key constraints from SD/IO to concepts
  pgm.addConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_sd_concept",
    {
      foreignKeys: {
        columns: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: { name: "concepts", schema: "hat" },
      },
    },
  );

  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "fk_io_concept",
    {
      foreignKeys: {
        columns: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: { name: "concepts", schema: "hat" },
      },
    },
  );
}

export function down(pgm: MigrationBuilder): void {
  // Drop foreign key constraints
  pgm.dropConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_sd_concept",
  );
  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "fk_io_concept",
  );

  // Drop concept_id column from files
  pgm.dropColumn({ name: "files", schema: "hat" }, "concept_id");

  // Drop concepts table (cascade will handle indexes)
  pgm.dropTable({ name: "concepts", schema: "hat" }, { cascade: true });
}
