import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(`
    UPDATE hat.source_datasets
    SET sd_info =
      sd_info-'cellxgeneDatasetId'-'cellxgeneDatasetVersion'-'cellxgeneExplorerUrl'-'assay'-'cellCount'-'disease'-'suspensionType'-'tissue'-'title'
  `);
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(`
    UPDATE hat.source_datasets
    SET sd_info=sd_info||'{
      "cellxgeneDatasetId": null,
      "cellxgeneDatasetVersion": null,
      "cellxgeneExplorerUrl": null,
      "assay": [],
      "cellCount": 0,
      "disease": [],
      "suspensionType": [],
      "tissue": [],
      "title": ""
    }'
  `);
}
