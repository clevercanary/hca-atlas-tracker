import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `UPDATE hat.source_datasets SET sd_info=sd_info||'{"assay": [], "cellxgeneExplorerUrl": null, "disease": [], "tissue": []}'||jsonb_build_object('cellxgeneDatasetVersion', sd_info->>'cellxgeneDatasetVersion'||'_OUTDATED')`
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    "UPDATE hat.source_datasets SET sd_info=sd_info-'assay'-'cellxgeneExplorerUrl'-'disease'-'tissue'"
  );
}
