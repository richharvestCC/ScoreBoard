const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ScoreBoard API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock auth route
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@scoreboard.com',
        role: 'admin'
      },
      accessToken: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    }
  });
});

// Mock data routes
app.get('/api/v1/competitions', (req, res) => {
  res.json({
    success: true,
    message: 'Competitions retrieved successfully',
    data: [
      {
        id: 1,
        name: '2025 K리그',
        competition_type: 'league',
        status: 'active',
        season: '2025'
      },
      {
        id: 2,
        name: '지역 축구 대회',
        competition_type: 'tournament',
        status: 'registration',
        season: '2025'
      }
    ]
  });
});

// Tournaments endpoint
app.get('/api/v1/tournaments', (req, res) => {
  res.json({
    success: true,
    message: 'Tournaments retrieved successfully',
    data: [
      {
        id: 1,
        name: '2025 WK리그 컵',
        description: '2025년 WK리그 우승컵 토너먼트',
        tournament_type: 'knockout',
        status: 'open',
        start_date: '2025-04-01',
        end_date: '2025-04-30',
        max_participants: 16,
        current_participants: 8,
        entry_fee: 50000,
        prize_description: '1등 500만원, 2등 200만원, 3등 100만원',
        location: '서울종합운동장',
        organizer: '한국여자축구연맹'
      },
      {
        id: 2,
        name: '지역 클럽 대항전',
        description: '전국 지역 클럽들의 대항전 토너먼트',
        tournament_type: 'round_robin',
        status: 'registration',
        start_date: '2025-05-15',
        end_date: '2025-06-15',
        max_participants: 12,
        current_participants: 6,
        entry_fee: 30000,
        prize_description: '1등 300만원, 2등 150만원',
        location: '전국 각지',
        organizer: '지역축구연합회'
      },
      {
        id: 3,
        name: '청소년 축구 대회',
        description: '만 16세 이하 청소년 축구 토너먼트',
        tournament_type: 'mixed',
        status: 'completed',
        start_date: '2025-03-01',
        end_date: '2025-03-31',
        max_participants: 24,
        current_participants: 24,
        entry_fee: 20000,
        prize_description: '1등 200만원, 2등 100만원, 3등 50만원',
        location: '부산아시아드경기장',
        organizer: '청소년축구연맹'
      }
    ]
  });
});

// Clubs endpoint
app.get('/api/v1/clubs', (req, res) => {
  res.json({
    success: true,
    message: 'Clubs retrieved successfully',
    data: [
      {
        id: 1,
        name: '수원FC위민',
        club_type: 'pro',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2009,
        location: '수원시',
        contact_email: 'info@suwonfc.com',
        contact_phone: '031-123-4567',
        website: 'https://suwonfc.com',
        logo_url: null,
        status: 'active',
        member_count: 25
      },
      {
        id: 2,
        name: '세종스포츠토토여자축구단',
        club_type: 'pro',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2018,
        location: '세종시',
        contact_email: 'info@sejongfc.com',
        contact_phone: '044-123-4567',
        website: 'https://sejongfc.com',
        logo_url: null,
        status: 'active',
        member_count: 28
      },
      {
        id: 3,
        name: '상봉조기축구회',
        club_type: 'amateur',
        description: '상봉지역 조기축구 동호회',
        founded_year: 2015,
        location: '서울시 중랑구',
        contact_email: 'sangbong@gmail.com',
        contact_phone: '02-123-4567',
        website: null,
        logo_url: null,
        status: 'active',
        member_count: 15
      }
    ]
  });
});

app.get('/api/v1/matches', (req, res) => {
  res.json({
    success: true,
    message: 'Matches retrieved successfully',
    data: [
      {
        id: 1,
        home_club: { name: '서울 FC' },
        away_club: { name: '부산 FC' },
        match_date: '2025-03-15T15:00:00Z',
        status: 'scheduled'
      }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`✅ ScoreBoard API Server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
});

module.exports = app;