const pool = require('../config/database');

// Create quiz
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, duration_minutes, passing_score } = req.body;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO quizzes (title, description, duration_minutes, passing_score, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, duration_minutes, passing_score || 50, userId]
    );
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update quiz
const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, duration_minutes, passing_score, is_active } = req.body;
    const connection = await pool.getConnection();
    
    await connection.query(
      `UPDATE quizzes 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           duration_minutes = COALESCE(?, duration_minutes),
           passing_score = COALESCE(?, passing_score),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [title, description, duration_minutes, passing_score, is_active, id]
    );
    
    connection.release();
    
    res.status(200).json({ message: 'Quiz updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete quiz
const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM quizzes WHERE id = ?', [id]);
    
    connection.release();
    
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all results
const getAllResults = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    
    const [results] = await connection.query(
      `SELECT qr.*, q.title, u.email, u.full_name
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       JOIN users u ON qr.user_id = u.id
       ORDER BY qr.submitted_at DESC`
    );
    
    connection.release();
    
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllResults
};
