const pool = require('../config/database');

// Create question
const createQuestion = async (req, res, next) => {
  try {
    const { quiz_id, question_text, question_type, points, options } = req.body;
    const connection = await pool.getConnection();
    
    // Insert question
    const [question] = await connection.query(
      `INSERT INTO questions (quiz_id, question_text, question_type, points)
       VALUES (?, ?, ?, ?)`,
      [quiz_id, question_text, question_type, points || 1]
    );
    
    const questionId = question.insertId;
    
    // Insert options if provided
    if (options && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        await connection.query(
          `INSERT INTO options (question_id, option_text, is_correct, display_order)
           VALUES (?, ?, ?, ?)`,
          [questionId, options[i].text, options[i].is_correct || false, i + 1]
        );
      }
    }
    
    connection.release();
    
    res.status(201).json({
      id: questionId,
      message: 'Question created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update question
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question_text, question_type, points } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      `UPDATE questions 
       SET question_text = COALESCE(?, question_text),
           question_type = COALESCE(?, question_type),
           points = COALESCE(?, points)
       WHERE id = ?`,
      [question_text, question_type, points, id]
    );
    
    connection.release();
    
    res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM questions WHERE id = ?', [id]);
    
    connection.release();
    
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion
};
