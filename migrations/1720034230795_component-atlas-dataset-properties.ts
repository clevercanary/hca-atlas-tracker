import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(`
    UPDATE hat.component_atlases c
    SET component_info = c.component_info || jsonb_build_object(
      'assay', cd.assay,
      'disease', cd.disease,
      'cellCount', cd.cell_count,
      'suspensionType', cd.suspension_type,
      'tissue', cd.tissue
    )
    FROM (
      SELECT
        csub.id AS id,
        coalesce(sum((d.sd_info->>'cellCount')::int), 0) AS cell_count,
        (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'assay')) v(x), jsonb_array_elements(x) e) AS assay,
        (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'disease')) v(x), jsonb_array_elements(x) e) AS disease,
        (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'suspensionType')) v(x), jsonb_array_elements(x) e) AS suspension_type,
        (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'tissue')) v(x), jsonb_array_elements(x) e) AS tissue
      FROM
        hat.component_atlases csub
        LEFT JOIN hat.source_datasets d
      ON d.id=ANY(csub.source_datasets)
      GROUP BY csub.id
    ) AS cd
    WHERE c.id=cd.id
  `);
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    "UPDATE hat.component_atlases SET component_info=component_info-'assay'-'cellCount'-'disease'-'suspensionType'-'tissue'"
  );
}
