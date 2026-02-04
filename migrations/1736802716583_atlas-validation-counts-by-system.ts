import { MigrationBuilder } from "node-pg-migrate";

const DEFAULT_INGESTION_COUNTS = {
  CAP: { completedCount: 0, count: 0 },
  CELLXGENE: { completedCount: 0, count: 0 },
  HCA_DATA_REPOSITORY: { completedCount: 0, count: 0 },
};

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.atlases SET overview=overview||'{"ingestionTaskCounts": ${JSON.stringify(
      DEFAULT_INGESTION_COUNTS,
    )}}'`,
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(`UPDATE hat.atlases SET overview=overview-'ingestionTaskCounts'`);
}
