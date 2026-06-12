// Generate JWT token payload
const generateTokenPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
};

// Format quiz response
const formatQuizResponse = (quiz, questions) => {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    duration_minutes: quiz.duration_minutes,
    passing_score: quiz.passing_score,
    question_count: questions.length,
    questions
  };
};

// Format result response
const formatResultResponse = (result, answers) => {
  return {
    id: result.id,
    quiz_id: result.quiz_id,
    user_id: result.user_id,
    score: result.score,
    total_points: result.total_points,
    percentage: result.percentage,
    passed: result.percentage >= 50,
    submitted_at: result.submitted_at,
    answers
  };
};

module.exports = {
  generateTokenPayload,
  formatQuizResponse,
  formatResultResponse
};
