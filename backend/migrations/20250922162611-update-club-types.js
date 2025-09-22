'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Club 타입 enum을 수정: general → univ, national → org 추가
    await queryInterface.sequelize.query(`
      ALTER TABLE clubs ALTER COLUMN club_type DROP DEFAULT;
      DROP TYPE IF EXISTS "enum_clubs_club_type_new";
      CREATE TYPE "enum_clubs_club_type_new" AS ENUM('pro', 'youth', 'univ', 'org');
      ALTER TABLE clubs ALTER COLUMN club_type TYPE "enum_clubs_club_type_new" USING
        CASE
          WHEN club_type = 'general' THEN 'univ'::enum_clubs_club_type_new
          WHEN club_type = 'national' THEN 'org'::enum_clubs_club_type_new
          ELSE club_type::text::enum_clubs_club_type_new
        END;
      DROP TYPE IF EXISTS "enum_clubs_club_type";
      ALTER TYPE "enum_clubs_club_type_new" RENAME TO "enum_clubs_club_type";
      ALTER TABLE clubs ALTER COLUMN club_type SET DEFAULT 'pro';
    `);
  },

  async down(queryInterface, Sequelize) {
    // 원래대로 복원
    await queryInterface.sequelize.query(`
      ALTER TABLE clubs ALTER COLUMN club_type DROP DEFAULT;
      DROP TYPE IF EXISTS "enum_clubs_club_type_old";
      CREATE TYPE "enum_clubs_club_type_old" AS ENUM('general', 'pro', 'youth', 'national');
      ALTER TABLE clubs ALTER COLUMN club_type TYPE "enum_clubs_club_type_old" USING
        CASE
          WHEN club_type = 'univ' THEN 'general'::enum_clubs_club_type_old
          WHEN club_type = 'org' THEN 'national'::enum_clubs_club_type_old
          ELSE club_type::text::enum_clubs_club_type_old
        END;
      DROP TYPE IF EXISTS "enum_clubs_club_type";
      ALTER TYPE "enum_clubs_club_type_old" RENAME TO "enum_clubs_club_type";
      ALTER TABLE clubs ALTER COLUMN club_type SET DEFAULT 'general';
    `);
  }
};