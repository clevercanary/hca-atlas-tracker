import { MigrationBuilder } from "node-pg-migrate";

const CONSTRAINT_NAME = "ck_files_validation_status";

const STATUSES_WITH_RESULTS_NOT_LOADED =
  "validation_status IN ('completed', 'job_failed', 'pending', 'request_failed', 'requested', 'results_not_loaded', 'stale')";

const STATUSES_WITHOUT_RESULTS_NOT_LOADED =
  "validation_status IN ('completed', 'job_failed', 'pending', 'request_failed', 'requested', 'stale')";

export function up(pgm: MigrationBuilder): void {
  pgm.dropConstraint({ name: "files", schema: "hat" }, CONSTRAINT_NAME);
  pgm.addConstraint({ name: "files", schema: "hat" }, CONSTRAINT_NAME, {
    check: STATUSES_WITH_RESULTS_NOT_LOADED,
  });
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropConstraint({ name: "files", schema: "hat" }, CONSTRAINT_NAME);
  // Existing rows with the dropped value have to be remapped before the
  // old constraint is re-added. JOB_FAILED is the closest pre-existing
  // sentinel for a tracker-side rejection of validator output.
  pgm.sql(
    "UPDATE hat.files SET validation_status = 'job_failed' WHERE validation_status = 'results_not_loaded'",
  );
  pgm.addConstraint({ name: "files", schema: "hat" }, CONSTRAINT_NAME, {
    check: STATUSES_WITHOUT_RESULTS_NOT_LOADED,
  });
}
