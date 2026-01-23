import { MigrationBuilder } from "node-pg-migrate";

// Update integrity_status to use "requested" (matching validation_status) instead of "validating"
export function up(pgm: MigrationBuilder): void {
  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "ck_files_integrity_status",
  );

  pgm.sql(
    "UPDATE hat.files SET integrity_status = CASE WHEN integrity_status = 'validating' THEN 'requested' ELSE integrity_status END",
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "ck_files_integrity_status",
    {
      check:
        "integrity_status IN ('pending', 'requested', 'valid', 'invalid', 'error')",
    },
  );

  pgm.alterColumn({ name: "files", schema: "hat" }, "integrity_status", {
    comment: "Status: pending, requested, valid, invalid, error",
  });
}

export function down(pgm: MigrationBuilder): void {
  pgm.alterColumn({ name: "files", schema: "hat" }, "integrity_status", {
    comment: "Status: pending, validating, valid, invalid, error",
  });

  pgm.dropConstraint(
    { name: "files", schema: "hat" },
    "ck_files_integrity_status",
  );

  pgm.sql(
    "UPDATE hat.files SET integrity_status = CASE WHEN integrity_status = 'requested' THEN 'validating' ELSE integrity_status END",
  );

  pgm.addConstraint(
    { name: "files", schema: "hat" },
    "ck_files_integrity_status",
    {
      check:
        "integrity_status IN ('pending', 'validating', 'valid', 'invalid', 'error')",
    },
  );
}
