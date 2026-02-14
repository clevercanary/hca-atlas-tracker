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
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        primaryKey: true,
        type: "uuid",
      },
      network: {
        notNull: true,
        type: "text",
      },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
    },
  );

  // Add unique index for concept fields
  pgm.createIndex(
    { name: "concepts", schema: "hat" },
    ["atlas_short_name", "base_filename", "file_type", "generation", "network"],
    {
      name: "idx_concepts_identity_fields",
      unique: true,
    },
  );

  // Add trigger to update `updated_at`
  pgm.createTrigger({ name: "concepts", schema: "hat" }, "update_updated_at", {
    function: { name: "update_updated_at_column", schema: "hat" },
    level: "ROW",
    operation: "UPDATE",
    when: "BEFORE",
  });

  // Create concepts for source datasets and component atlases
  // To ensure compatibility, the regular expressions used for short name and generation are based on the one used to parse an atlas name for file insertion
  // File names are assumed to already lack version information, since that feature doesn't exist at the time of migration
  pgm.sql(
    `
      INSERT INTO hat.concepts (atlas_short_name, base_filename, file_type, generation, id, network)
      SELECT
        lower(substring(f.key from '^[^/]*/(.+)-v\\d+(?:-\\d+)*/')),
        split_part(f.key, '/', -1),
        'source_dataset',
        substring(f.key from '^[^/]*/.+-v(\\d+)(?:-\\d+)*/')::int,
        d.id,
        split_part(f.key, '/', 1)
      FROM hat.source_datasets d
      LEFT JOIN hat.files f ON d.file_id = f.id
      WHERE d.is_latest
    `,
  );
  pgm.sql(
    `
      INSERT INTO hat.concepts (atlas_short_name, base_filename, file_type, generation, id, network)
      SELECT
        lower(substring(f.key from '^[^/]*/(.+)-v\\d+(?:-\\d+)*/')),
        split_part(f.key, '/', -1),
        'integrated_object',
        substring(f.key from '^[^/]*/.+-v(\\d+)(?:-\\d+)*/')::int,
        c.id,
        split_part(f.key, '/', 1)
      FROM hat.component_atlases c
      LEFT JOIN hat.files f ON c.file_id = f.id
      WHERE c.is_latest
    `,
  );

  // Add foreign key constraints to source dataset and component atlas `id` (concept ID)
  pgm.addConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_source_datasets_id",
    {
      foreignKeys: {
        columns: "id",
        references: { name: "concepts", schema: "hat" },
      },
    },
  );
  pgm.addConstraint(
    { name: "component_atlases", schema: "hat" },
    "fk_component_atlases_id",
    {
      foreignKeys: {
        columns: "id",
        references: { name: "concepts", schema: "hat" },
      },
    },
  );

  // Add concept ID column to files
  // This will be kept as nullable, since ingest manifests don't have concepts
  pgm.addColumns(
    { name: "files", schema: "hat" },
    {
      concept_id: {
        references: { name: "concepts", schema: "hat" },
        type: "uuid",
      },
    },
  );

  // Populate concept ID from source datasets and component atlases
  pgm.sql(
    "UPDATE hat.files f SET concept_id = d.id FROM hat.source_datasets d WHERE d.file_id = f.id",
  );
  pgm.sql(
    "UPDATE hat.files f SET concept_id = c.id FROM hat.component_atlases c WHERE c.file_id = f.id",
  );
}

export function down(pgm: MigrationBuilder): void {
  // Drop files `concept_id`
  pgm.dropColumn({ name: "files", schema: "hat" }, "concept_id");

  // Drop constraints referencing concepts
  pgm.dropConstraint(
    { name: "source_datasets", schema: "hat" },
    "fk_source_datasets_id",
  );
  pgm.dropConstraint(
    { name: "component_atlases", schema: "hat" },
    "fk_component_atlases_id",
  );

  // Drop concepts table
  pgm.dropTable({ name: "concepts", schema: "hat" });
}
