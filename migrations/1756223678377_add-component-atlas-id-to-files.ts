import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Remove legacy atlas_id FK and column from files (no longer used)
  pgm.dropConstraint({ name: "files", schema: "hat" }, "fk_files_atlas_id", {
    ifExists: true,
  });

  pgm.dropColumn({ name: "files", schema: "hat" }, "atlas_id", {
    ifExists: true,
  });

  // Add component_atlas_id column to files table
  pgm.addColumn(
    { name: "files", schema: "hat" },
    {
      component_atlas_id: {
        comment: "FK to component_atlases.id - set for integrated_object files",
        notNull: false,
        type: "uuid",
      },
    },
  );

  // Add source_dataset_id column to files table
  pgm.addColumn(
    { name: "files", schema: "hat" },
    {
      source_dataset_id: {
        comment: "FK to source_datasets.id - set for source_dataset files",
        notNull: false,
        type: "uuid",
      },
    },
  );

  // Add sns_message_id column for proper SNS message idempotency
  pgm.addColumn(
    { name: "files", schema: "hat" },
    {
      sns_message_id: {
        comment:
          "SNS MessageId for deduplication of duplicate SNS notifications",
        notNull: true,
        type: "varchar(255)",
      },
    },
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
    },
  );

  // Add foreign key constraint for source dataset relationship
  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id",
    {
      foreignKeys: {
        columns: "source_dataset_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        references: { name: "source_datasets", schema: "hat" },
      },
    },
  );

  // Add indexes for efficient queries
  pgm.createIndex({ name: "files", schema: "hat" }, ["component_atlas_id"]);
  pgm.createIndex({ name: "files", schema: "hat" }, ["source_dataset_id"]);

  // Add unique constraint for SNS MessageId (proper SNS idempotency)
  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "uq_files_sns_message_id",
    {
      unique: ["sns_message_id"],
    },
  );

  // Clear existing file data (nothing links to files, safe to delete)
  // Note: Run manually if needed - pgm.sql("DELETE FROM hat.files;");

  // Make source_study_id nullable on source_datasets table
  pgm.alterColumn(
    { name: "source_datasets", schema: "hat" },
    "source_study_id",
    {
      notNull: false,
    },
  );

  // Update constraint to use new exclusive foreign key pattern
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "ck_files_exclusive_parent_relationship",
    { ifExists: true },
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "ck_files_exclusive_parent_relationship",
    {
      check: `(
        (file_type = 'source_dataset' AND source_dataset_id IS NOT NULL AND component_atlas_id IS NULL) OR
        (file_type = 'integrated_object' AND source_dataset_id IS NULL AND component_atlas_id IS NOT NULL) OR
        (file_type = 'ingest_manifest' AND source_dataset_id IS NULL AND component_atlas_id IS NULL)
      )`,
    },
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop current constraint
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "ck_files_exclusive_parent_relationship",
    { ifExists: true },
  );

  // Note: Not restoring original constraint as it would conflict with new schema
  // Original constraint expected atlas_id and source_study_id columns which are incompatible
  // with the new component_atlas_id and source_dataset_id columns

  // Note: Not restoring source_study_id as NOT NULL since we have NULL values
  // and this change was intentional to support the new workflow

  // Remove index (if exists)
  pgm.dropIndex({ name: "files", schema: "hat" }, ["component_atlas_id"], {
    ifExists: true,
  });

  // Remove foreign key constraint (if exists)
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_component_atlas_id",
    { ifExists: true },
  );

  // Remove source dataset foreign key constraint (if exists)
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "fk_files_source_dataset_id",
    { ifExists: true },
  );

  // Remove source dataset index (if exists)
  pgm.dropIndex({ name: "files", schema: "hat" }, ["source_dataset_id"], {
    ifExists: true,
  });

  // Remove SNS MessageId unique constraint (if exists)
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "uq_files_sns_message_id",
    { ifExists: true },
  );

  // Intentionally do not restore legacy atlas_id or its FK to avoid conflicts

  // Remove columns (if exists)
  pgm.dropColumn({ name: "files", schema: "hat" }, "component_atlas_id", {
    ifExists: true,
  });
  pgm.dropColumn({ name: "files", schema: "hat" }, "source_dataset_id", {
    ifExists: true,
  });
  pgm.dropColumn({ name: "files", schema: "hat" }, "sns_message_id", {
    ifExists: true,
  });
}
