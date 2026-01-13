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

// MongoDB 연결 및 서버 시작
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    
    // MongoDB 연결 성공 후 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}번에서 실행 중입니다.`);
      console.log(`📍 접속 주소: http://localhost:${PORT}`);
      console.log(`📝 할일 API: http://localhost:${PORT}/todos`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB 연결 실패:', error.message);
    console.error('MONGODB_URI:', MONGODB_URI ? '설정됨' : '설정되지 않음');
    console.error('\n해결 방법:');
    console.error('1. MongoDB Atlas Network Access에서 모든 IP 허용 (0.0.0.0/0)');
    console.error('2. Heroku 환경변수에 MONGODB_URI 설정 확인');
    console.error('3. MongoDB Atlas 연결 문자열이 올바른지 확인');
    process.exit(1); // 연결 실패 시 앱 종료
  });