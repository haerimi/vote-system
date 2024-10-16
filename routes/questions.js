const express = require('express');
const { addQuestion, allQuestion, editQuestion, deleteQuestion } = require('../controller/QuestionController');
const router = express.Router();

router.use(express.json())

router.post('/:id/questions', addQuestion);  // 질문 추가
router.get('/:id/questions', allQuestion); // 질문 조회
router.patch('/:id/questions/:question_id', editQuestion); // 질문 수정
router.delete('/:id/questions', deleteQuestion); // 질문 삭제

// 모듈화
module.exports = router