import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

exports.up = (pgm: MigrationBuilder): void => {
  // Insert users with ON CONFLICT to avoid inserting duplicates
  pgm.sql(`
    INSERT INTO hat.users (disabled, email, full_name, role) VALUES 
    (false, 'alex@clevercanary.com', 'Alex Fomin', 'CONTENT_ADMIN'),
    (false, 'dave@clevercanary.com', 'David Rogers', 'CONTENT_ADMIN'),
    (false, 'esther@clevercanary.com', 'Esther McDade', 'CONTENT_ADMIN'),
    (false, 'fran@clevercanary.com', 'Fran McDade', 'CONTENT_ADMIN'),
    (false, 'hunter@clevercanary.com', 'Hunter Craft', 'CONTENT_ADMIN'),
    (false, 'mim@clevercanary.com', 'Mim Hastie', 'CONTENT_ADMIN')
    ON CONFLICT (email) DO NOTHING;
  `);
};

exports.down = (pgm: MigrationBuilder): void => {
  // Optionally, provide a way to undo this migration
  pgm.sql(`
    DELETE FROM hat.users WHERE email IN (
      'alex@clevercanary.com',
      'dave@clevercanary.com',
      'esther@clevercanary.com',
      'fran@clevercanary.com',
      'hunter@clevercanary.com',
      'mim@clevercanary.com'
    );
  `);
};
