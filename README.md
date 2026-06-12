# Online Quiz System - Backend

A comprehensive backend-intensive quiz application built with **Node.js**, **Express.js**, and **MySQL**. Features server-controlled timed quizzes, secure storage, role-based access, and comprehensive admin management.

## Features

- ✅ **Server-Controlled Timed Quizzes** - Server manages quiz timing and auto-submission
- ✅ **Secure Authentication** - JWT-based authentication with role separation
- ✅ **Admin Dashboard** - Full quiz and question management
- ✅ **Relational Database** - Normalized MySQL schema with proper constraints
- ✅ **Score Calculation** - Real-time scoring with result persistence
- ✅ **Error Handling** - Comprehensive validation and error middleware
- ✅ **Security** - Password hashing, CORS, rate limiting, input validation

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL with relational design
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, express-validator
- **Rate Limiting**: express-rate-limit

## Project Structure

```
online-quiz-system/
├── config/
│   └── database.js           # MySQL connection pool
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── quizController.js     # Quiz CRUD operations
│   ├── questionController.js # Question management
│   ├── answerController.js   # Answer submission & scoring
│   └── adminController.js    # Admin operations
├── models/
│   ├── User.js
│   ├── Quiz.js
│   ├── Question.js
│   ├── QuizResult.js
│   └── Answer.js
├── routes/
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   ├── questionRoutes.js
│   ├── answerRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── errorHandler.js       # Global error handling
│   ├── validation.js         # Input validation
│   └── rateLimiter.js        # Rate limiting
├── utils/
│   ├── dbUtils.js            # Database utilities
│   ├── scoreCalculator.js    # Score computation
│   └── helpers.js            # Helper functions
├── scripts/
│   └── initDB.js             # Database initialization script
├── tests/
│   └── [test files]
├── .env.example
├── .gitignore
├── server.js                 # Entry point
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/patrarrabisankar-pixel/online-quiz-system-.git
   cd online-quiz-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:init
   ```

5. **Start the server**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Quiz Endpoints (User)

- `GET /api/quizzes` - List all available quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/start` - Start a quiz
- `GET /api/quizzes/:id/status` - Get quiz progress

### Answer & Scoring Endpoints

- `POST /api/quizzes/:id/answer` - Submit answer
- `POST /api/quizzes/:id/submit` - Submit quiz
- `GET /api/results/:id` - Get quiz result

### Admin Endpoints

- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/:id` - Update quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/results` - View all results

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Quizzes Table
```sql
CREATE TABLE quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  passing_score INT DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Questions Table
```sql
CREATE TABLE questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
  points INT DEFAULT 1,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
```

### Options Table
```sql
CREATE TABLE options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text VARCHAR(500),
  is_correct BOOLEAN DEFAULT FALSE,
  display_order INT,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

### Quiz Results Table
```sql
CREATE TABLE quiz_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT,
  total_points INT,
  percentage DECIMAL(5, 2),
  status ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress',
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_quiz_user (quiz_id, user_id)
);
```

### User Answers Table
```sql
CREATE TABLE user_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_result_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_id INT,
  answer_text VARCHAR(1000),
  is_correct BOOLEAN,
  points_earned INT DEFAULT 0,
  answered_at TIMESTAMP,
  FOREIGN KEY (quiz_result_id) REFERENCES quiz_results(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES options(id)
);
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator for all inputs
- **CORS**: Configured for secure cross-origin requests
- **Rate Limiting**: Prevent brute force attacks
- **Helmet**: HTTP security headers
- **SQL Injection Prevention**: Parameterized queries

## Error Handling

- Global error middleware for consistent error responses
- Validation error formatting
- Database error handling
- Authentication error responses
- Business logic error handling

## Testing

Run the test suite:
```bash
npm test
```

## Development

1. Start development server with hot reload:
   ```bash
   npm run dev
   ```

2. The server will run on `http://localhost:3000` by default

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
