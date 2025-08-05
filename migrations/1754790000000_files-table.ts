import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.createTable(
    { name: "files", schema: "hat" },
    {
      created_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      id: {
        default: pgm.func("gen_random_uuid ()"),
        notNull: true,
        type: "uuid",
      },
      updated_at: {
        default: pgm.func("CURRENT_TIMESTAMP"),
        notNull: true,
        type: "timestamp",
      },
      
      // S3 Object Identity
      bucket: {
        notNull: true,
        type: "varchar(255)",
      },
      key: {
        notNull: true,
        type: "text",
      },
      version_id: {
        type: "varchar(255)",
      },
      
      // File Identity & Integrity
      etag: {
        notNull: true,
        type: "varchar(255)",
      },
      size_bytes: {
        notNull: true,
        type: "bigint",
      },
      sha256: {
        type: "varchar(64)",
      },
      
      // File Metadata
      file_info: {
        notNull: true,
        type: "jsonb",
      },
      
      // Status & Processing
      status: {
        default: "'uploaded'",
        notNull: true,
        type: "varchar(50)",
      },
    }
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "pk_files_id",
    {
      primaryKey: "id",
    }
  );

  // Unique constraint for S3 object identity (bucket + key + version)
  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "uq_files_bucket_key_version",
    {
      unique: ["bucket", "key", "version_id"],
    }
  );

  // Index for common queries
  pgm.createIndex(
    { name: "files", schema: "hat" },
    ["bucket", "key"]
  );

  pgm.createIndex(
    { name: "files", schema: "hat" },
    ["status"]
  );

  pgm.createIndex(
    { name: "files", schema: "hat" },
    ["created_at"]
  );

  // Add updated_at trigger following existing pattern
  pgm.createTrigger(
    { name: "files", schema: "hat" },
    "update_updated_at",
    {
      function: { name: "update_updated_at_column", schema: "hat" },
      level: "ROW",
      operation: "UPDATE",
      when: "BEFORE",
    }
  );
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.dropTable({ name: "files", schema: "hat" });
};
