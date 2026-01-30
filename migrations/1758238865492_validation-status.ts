import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.renameColumn(
    { name: "files", schema: "hat" },
    "status",
    "validation_status",
  );

  pgm.alterColumn({ name: "files", schema: "hat" }, "validation_status", {
    default: "'pending'",
  });

  // Infer validation status based on integrity status:
  // "pending" maps to "pending";
  // "validating" is unused pre-migration but theoretically corresponds to "requested";
  // any other value indicates that an integrity status was received from the validator and that the validator completed successfully (thus "completed")
  pgm.sql(
    `
      UPDATE hat.files
      SET validation_status =
        CASE
          WHEN integrity_status = 'pending' THEN 'pending'
          WHEN integrity_status = 'validating' THEN 'requested'
          ELSE 'completed'
        END
    `,
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "ck_files_validation_status",
    {
      check:
        "validation_status IN ('completed', 'job_failed', 'pending', 'request_failed', 'requested', 'stale')",
    },
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "ck_files_validation_status",
  );

  pgm.sql("UPDATE hat.files SET validation_status = 'uploaded'");

  pgm.alterColumn({ name: "files", schema: "hat" }, "validation_status", {
    default: "'uploaded'",
  });

  pgm.renameColumn(
    { name: "files", schema: "hat" },
    "validation_status",
    "status",
  );
}
