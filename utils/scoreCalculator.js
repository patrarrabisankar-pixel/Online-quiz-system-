// Calculate quiz score
const calculateScore = (userAnswers, questions) => {
  let totalScore = 0;
  let totalPoints = 0;

  questions.forEach(question => {
    totalPoints += question.points;
    const userAnswer = userAnswers.find(ua => ua.question_id === question.id);
    if (userAnswer && userAnswer.is_correct) {
      totalScore += question.points;
    }
  });

  return {
    score: totalScore,
    totalPoints,
    percentage: totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0,
    passed: totalPoints > 0 ? (totalScore / totalPoints) * 100 >= 50 : false
  };
};

// Check if time expired
const isTimeExpired = (startTime, durationMinutes) => {
  const now = new Date();
  const elapsed = (now - startTime) / (1000 * 60);
  return elapsed > durationMinutes;
};

module.exports = {
  calculateScore,
  isTimeExpired
};
