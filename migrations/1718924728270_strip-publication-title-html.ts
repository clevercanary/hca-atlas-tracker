import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder): void {
  pgm.sql(`
    UPDATE hat.source_studies
    SET
      study_info = jsonb_set(
        study_info,
        '{publication}',
        study_info->'publication' || jsonb_build_object(
          'title',
          regexp_replace(
            replace(study_info->'publication'->>'title', '&amp;', '&'),
            '<[[:space:]]*(?:/[[:space:]]*)?[[:alpha:]]+[[:space:]]*(?:/[[:space:]]*)?>',
            '',
            'g'
          ),
          'journal',
          regexp_replace(
            replace(study_info->'publication'->>'journal', '&amp;', '&'),
            '<[[:space:]]*(?:/[[:space:]]*)?[[:alpha:]]+[[:space:]]*(?:/[[:space:]]*)?>',
            '',
            'g'
          )
        )
      )
    WHERE NOT study_info->'publication'='null'
  `);
}

export const down = (): void => undefined;
