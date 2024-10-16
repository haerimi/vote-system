// express 모듈
const express = require('express');
const app = express();


// dotenv 모듈
const dotenv = require('dotenv')
dotenv.config();

app.listen(process.env.PORT);

const questionRouter = require('./routes/questions');

// 공통 URL 밖으로 내보내기
app.use('/surveys', questionRouter);