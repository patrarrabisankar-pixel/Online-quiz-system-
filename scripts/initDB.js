const mysql = require('mysql2/promise');
require('dotenv').config();

const initializeDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'quiz_system'}`);
    console.log('Database created successfully');

    // Use database
    await connection.query(`USE ${process.env.DB_NAME || 'quiz_system'}`);

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INT NOT NULL,
        passing_score INT DEFAULT 50,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Quizzes table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
        points INT DEFAULT 1,
        display_order INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);
    console.log('Questions table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS options (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT NOT NULL,
        option_text VARCHAR(500),
        is_correct BOOLEAN DEFAULT FALSE,
        display_order INT,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);
    console.log('Options table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT NOT NULL,
        user_id INT NOT NULL,
        score INT,
        total_points INT,
        percentage DECIMAL(5, 2),
        status ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress',
        started_at TIMESTAMP,
        submitted_at TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_quiz_user (quiz_id, user_id)
      )
    `);
    console.log('Quiz Results table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_result_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option_id INT,
        answer_text VARCHAR(1000),
        is_correct BOOLEAN,
        points_earned INT DEFAULT 0,
        answered_at TIMESTAMP,
        FOREIGN KEY (quiz_result_id) REFERENCES quiz_results(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (selected_option_id) REFERENCES options(id) ON DELETE SET NULL
      )
    `);
    console.log('User Answers table created');

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
};

initializeDatabase();
