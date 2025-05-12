const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

app.use(cors()); // 💡 반드시 추가!

// .env 파일에서 환경변수 읽기
dotenv.config();
const PORT = 4000;

app.use(cors()); // 모든 도메인에서 접근 허용

// 가져올 심볼 목록
const symbols = [
  //'DXY/USD',     // 달러 인덱스
  //'WTI/USD',     // WTI 달러인덱스 및 유가 무료플랜에서는 지원끊김
  'SPX',        // S&P500
  'NDX',         // NASDAQ 100
  'USD/KRW',     // 원화 환율
  'USD/JPY',     // 엔화 환율
  'USD/CHF'      // 스위스프랑 환율
];

// API 요청 핸들러
app.get('/market-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.twelvedata.com/price', {
      params: {
        symbol: symbols.join(','),
        apikey: process.env.TWELVEDAT
      }
    });

    res.json(response.data); // 성공 응답
  } catch (err) {
    console.error('❌ API 요청 실패:', err.message);
    res.status(500).json({ message: 'TwelveData API 오류', error: err.message });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 프록시 서버 실행됨: http://localhost:${PORT}`);
});