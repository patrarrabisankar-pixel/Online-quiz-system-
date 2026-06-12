const pool = require('../config/database');

// Submit answer
const submitAnswer = async (req, res, next) => {
  try {
    const { quizResultId, questionId, selectedOptionId, answerText } = req.body;
    const connection = await pool.getConnection();
    
    // Validate question exists
    const [question] = await connection.query(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );
    
    if (question.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Question not found' });
    }
    
    let isCorrect = false;
    if (selectedOptionId) {
      const [option] = await connection.query(
        'SELECT is_correct FROM options WHERE id = ? AND question_id = ?',
        [selectedOptionId, questionId]
      );
      isCorrect = option.length > 0 && option[0].is_correct;
    }
    
    const pointsEarned = isCorrect ? question[0].points : 0;
    
    // Insert user answer
    await connection.query(
      `INSERT INTO user_answers 
       (quiz_result_id, question_id, selected_option_id, answer_text, is_correct, points_earned, answered_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       selected_option_id = VALUES(selected_option_id),
       answer_text = VALUES(answer_text),
       is_correct = VALUES(is_correct),
       points_earned = VALUES(points_earned),
       answered_at = NOW()`,
      [quizResultId, questionId, selectedOptionId || null, answerText || null, isCorrect, pointsEarned]
    );
    
    connection.release();
    
    res.status(201).json({
      message: 'Answer submitted successfully',
      isCorrect,
      pointsEarned
    });
  } catch (error) {
    next(error);
  }
};

// Submit quiz and calculate score
const submitQuiz = async (req, res, next) => {
  try {
    const { quizResultId } = req.body;
    const connection = await pool.getConnection();
    
    // Get quiz result and all answers
    const [result] = await connection.query(
      'SELECT * FROM quiz_results WHERE id = ?',
      [quizResultId]
    );
    
    if (result.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Quiz result not found' });
    }
    
    const quizResult = result[0];
    
    // Calculate total points
    const [answers] = await connection.query(
      `SELECT COALESCE(SUM(points_earned), 0) as score,
              COALESCE(SUM(q.points), 0) as total_points
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.quiz_result_id = ?`,
      [quizResultId]
    );
    
    const score = answers[0].score;
    const totalPoints = answers[0].total_points;
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    
    // Update quiz result
    await connection.query(
      `UPDATE quiz_results 
       SET score = ?, total_points = ?, percentage = ?, status = 'graded', submitted_at = NOW()
       WHERE id = ?`,
      [score, totalPoints, percentage.toFixed(2), quizResultId]
    );
    
    connection.release();
    
    res.status(200).json({
      message: 'Quiz submitted successfully',
      score,
      totalPoints,
      percentage: percentage.toFixed(2),
      passed: percentage >= 50
    });
  } catch (error) {
    next(error);
  }
};

// Get quiz result
const getResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `SELECT qr.*, q.title, q.passing_score, u.full_name
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       JOIN users u ON qr.user_id = u.id
       WHERE qr.id = ? AND qr.user_id = ?`,
      [id, userId]
    );
    
    if (result.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Result not found' });
    }
    
    const [answers] = await connection.query(
      `SELECT ua.*, q.question_text, q.points, o.option_text as selected_text
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       LEFT JOIN options o ON ua.selected_option_id = o.id
       WHERE ua.quiz_result_id = ?`,
      [id]
    );
    
    connection.release();
    
    res.status(200).json({
      ...result[0],
      answers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAnswer,
  submitQuiz,
  getResult
};
