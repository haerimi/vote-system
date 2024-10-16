const mariadb = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');  // status code 모듈
const conn = require('../mariadb'); // DB 모듈

const addQuestion = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'surveys',
        dateStrings : true
    });

    const {question_text, question_type, order_num, required, options} = req.body;
    const surveyId = req.params.id;

    // questions 테이블 삽입
    let questions_sql = `INSERT INTO questions (survey_id, question_text, question_type, order_num, required) VALUES (?, ?, ?, ?, ?);`
    let questions_values = [surveyId, question_text, question_type, order_num, required];
    let [questions_results] = await conn.execute(questions_sql, questions_values);
    let question_id = questions_results.insertId;
    
    // question_options 테이블 삽입 
    let question_options_sql = `INSERT INTO question_options (question_id, option_text, question_num) VALUES ?;`;

    // items는 배열로 받아오기 때문에 요소들을 하나씩 꺼냄
    let question_options_values = options.map(options => [question_id, options.option_text, options.question_num]);

    // 오류가 발생할 수 있으므로 query로 계속 진행
    let [question_options_results] = await conn.query(question_options_sql, [question_options_values]); 
    
    return res.status(StatusCodes.OK).json(question_options_results);
};

const allQuestion = (req, res) => {
    let {id} = req.params;
    let sql = `SELECT question_id, question_text, question_type , option_text 
                FROM questions LEFT JOIN question_options
                ON questions.id = question_options.question_id
                WHERE question_id = ?;`;
    conn.query(sql, id, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
        }

        return res.status(StatusCodes.OK).json(result);
    })
};

const editQuestion = (req, res) => {
    let {question_text, question_type, option_text} = req.body;
    let {id, question_id} = req.params;
    let {editOptions, editQuestion} = req.query; // 쿼리 파라미터로 작업 구분
    let sql;
    let values = [];
    
    if (editQuestion) {
        // 질문 수정
        sql = `UPDATE questions
        SET question_text = ?,
        question_type = ?
        WHERE id = ?;`; // 여기서 id는 question_id
        values = [question_text, question_type, id];
        
    } else if (editOptions) {   
        // 옵션 수정
        sql = `UPDATE question_options
        SET option_text = ?
        WHERE question_id = ? AND question_num = ?`;
        values = [option_text, id, question_id];
    }
        conn.query(sql, values, 
            (err, result) => {
                if (err) {
                return res.status(500).send('Error updating question');
            }
        });

        return res.status(StatusCodes.OK).json({ message: "Update successful" });
};

const deleteQuestion = (req, res) => {
    let {id} = req.params;
    let {deleteOptions, deleteQuestion} = req.query; // 쿼리 파라미터로 작업 구분

    if (deleteOptions) {
        // 옵션 삭제
        let option_sql = `DELETE FROM question_options WHERE question_id = ?;`;
        conn.query(option_sql, id, (err, result) => {
            if (err) {
                return res.status(500).send('Error updating question');
            }
            return res.status(StatusCodes.OK).json({ message: "Update successful" });
        }); 
    } else if (deleteQuestion) {
        // 질문 삭제시, 옵션을 먼저 삭제
        let option_sql = `DELETE FROM question_options WHERE question_id = ?;`;
        conn.query(option_sql, id, (err, result) => {
            if (err) {
                return res.status(500).send('Error deleting question options');
            }
            // 질문 삭제
            let question_sql = `DELETE FROM questions WHERE id = ?;`;
            conn.query(question_sql, id, (err, result) => {
                if (err) {
                    return res.status(500).send('Error deleting question');
                }
                return res.status(StatusCodes.OK).json({ message: "Question deleted successfully" });
            });
        });
    } else {
        return res.status(400).json({ message: "Please specify whether to delete options or question." });
    }
};

module.exports = {
    addQuestion,
    allQuestion,
    editQuestion,
    deleteQuestion
}