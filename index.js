require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const todoRouter = require('./routers/todoRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정 - 모든 도메인 허용
app.use(cors({
  origin: true, // 모든 origin 허용
  credentials: true
}));

// JSON 파싱 미들웨어
app.use(express.json());

// 요청 로깅 미들웨어 (개발용)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
  })
  .catch((error) => {
    console.error('❌ MongoDB 연결 실패:', error.message);
    console.error('\n해결 방법:');
    console.error('1. MongoDB가 설치되어 있고 실행 중인지 확인하세요');
    console.error('2. 또는 MongoDB Atlas를 사용하는 경우 환경변수로 연결 문자열을 설정하세요');
    console.error('   예: $env:MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/todo"');
    // MongoDB 연결 실패해도 서버는 계속 실행 (API는 실패하지만 서버는 살아있음)
  });

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '서버가 실행 중입니다.',
    timestamp: new Date().toISOString(),
    endpoints: {
      todos: '/todos'
    }
  });
});

// 할일 라우터
app.use('/todos', todoRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ 
    error: '요청한 경로를 찾을 수 없습니다.',
    path: req.path 
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(err.status || 500).json({
    error: err.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}번에서 실행 중입니다.`);
  console.log(`📍 접속 주소: http://localhost:${PORT}`);
  console.log(`📝 할일 API: http://localhost:${PORT}/todos`);
});