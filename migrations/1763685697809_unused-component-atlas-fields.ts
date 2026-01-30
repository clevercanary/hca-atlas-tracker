import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.dropColumn({ name: "component_atlases", schema: "hat" }, "title");

  pgm.sql(`
    UPDATE hat.component_atlases
    SET component_info =
      component_info-'cellxgeneDatasetId'-'cellxgeneDatasetVersion'-'description'-'assay'-'cellCount'-'disease'-'suspensionType'-'tissue'
  `);
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(`
    UPDATE hat.component_atlases
    SET component_info=component_info||'{
      "cellxgeneDatasetId": null,
      "cellxgeneDatasetVersion": null,
      "description": "",
      "assay": [],
      "cellCount": 0,
      "disease": [],
      "suspensionType": [],
      "tissue": []
    }'
  `);

  pgm.addColumns(
    { name: "component_atlases", schema: "hat" },
    {
      title: {
        default: "",
        notNull: true,
        type: "text",
      },
    },
  );
}
