import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  // Update objects in the `metadataSpreadsheets` array in `study_info` of source studies
  // `url` is removed and `id` is added, with value determined by splitting the URL on `/` and selecting the 6th item
  // (This should be reliable for natural Google Sheets URLs, but would not work for one with a fragment or query string manually placed directly after the ID)
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
    `,
  );
}

export function down(pgm: MigrationBuilder): void {
  // Similar to `up` but creating `url` from `id` by concatenating URL parts around it
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
    `,
  );
}
