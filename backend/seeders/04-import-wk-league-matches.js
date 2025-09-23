'use strict';

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // CSV 파일 읽기 및 매치 데이터 생성
    const csvFilePath = path.join(__dirname, '../../data/wkl.csv');
    const matches = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // CSV 데이터를 매치 형식으로 변환
          const match = {
            match_id: row.id,
            competition_id: row.competition_id,
            round: parseInt(row.round),
            match_number: parseInt(row.match_no),
            match_date: new Date(row.match_date + ' ' + row.match_time),
            home_club_id: row.home_id,
            away_club_id: row.away_id,
            home_score: row.home_points ? parseInt(row.home_points) : null,
            away_score: row.away_points ? parseInt(row.away_points) : null,
            venue: row.venue,
            status: (row.home_points !== '' && row.away_points !== '') ? 'completed' : 'scheduled',
            live_link: row.live_link || null,
            notes: row.notes || null,
            weather: null,
            attendance: null,
            referee: null,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };

          matches.push(match);
        })
        .on('end', async () => {
          try {
            console.log(`Processing ${matches.length} matches from CSV...`);

            // 배치로 매치 데이터 삽입
            await queryInterface.bulkInsert('matches', matches);

            console.log(`Successfully imported ${matches.length} WK League matches`);
            resolve();
          } catch (error) {
            console.error('Error importing matches:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('matches', { competition_id: '2025_league_wk' });
  }
};