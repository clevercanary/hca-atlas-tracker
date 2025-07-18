import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(
    `
      UPDATE hat.source_studies s
      SET study_info = jsonb_set(
        s.study_info,
        '{metadataSpreadsheets}',
        (
          SELECT coalesce(
            jsonb_agg(
              jsonb_set(
                sheet.info - 'url',
                '{id}',
                to_jsonb(split_part(sheet.info ->> 'url', '/', 6))
              )
            ),
            '[]'
          )
          FROM jsonb_array_elements(s.study_info -> 'metadataSpreadsheets') AS sheet(info)
        )
      )
    `
  );
}

export function down(pgm: MigrationBuilder): void {
  pgm.sql(
    `
      UPDATE hat.source_studies s
      SET study_info = jsonb_set(
        s.study_info,
        '{metadataSpreadsheets}',
        (
          SELECT coalesce(
            jsonb_agg(
              jsonb_set(
                sheet.info - 'id',
                '{url}',
                to_jsonb('https://docs.google.com/spreadsheets/d/' || (sheet.info ->> 'id') || '/edit')
              )
            ),
            '[]'
          )
          FROM jsonb_array_elements(s.study_info -> 'metadataSpreadsheets') AS sheet(info)
        )
      )
    `
  );
}
