const pool = require('../config/database');

// Get all quizzes
const getAllQuizzes = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [quizzes] = await connection.query(
      'SELECT * FROM quizzes WHERE is_active = true ORDER BY created_at DESC'
    );
    connection.release();
    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
};

// Get quiz by ID with questions
const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const [quiz] = await connection.query(
      'SELECT * FROM quizzes WHERE id = ?',
      [id]
    );
    
    if (quiz.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const [questions] = await connection.query(
      `SELECT q.*, GROUP_CONCAT(
        JSON_OBJECT('id', o.id, 'text', o.option_text, 'order', o.display_order)
      ) as options FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      WHERE q.quiz_id = ?
      GROUP BY q.id
      ORDER BY q.display_order`,
      [id]
    );
    
    connection.release();
    
    res.status(200).json({
      ...quiz[0],
      questions: questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Start quiz
const startQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    // Check if quiz exists
    const [quiz] = await connection.query(
      'SELECT * FROM quizzes WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (quiz.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user already has an active attempt
    const [existing] = await connection.query(
      'SELECT id FROM quiz_results WHERE quiz_id = ? AND user_id = ? AND status != "submitted"',
      [id, userId]
    );
    
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Quiz already in progress' });
    }
    
    // Create new quiz result
    const [result] = await connection.query(
      `INSERT INTO quiz_results (quiz_id, user_id, status, started_at) 
       VALUES (?, ?, 'in_progress', NOW())`,
      [id, userId]
    );
    
    connection.release();
    
    res.status(201).json({
      resultId: result.insertId,
      message: 'Quiz started successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  startQuiz
};
