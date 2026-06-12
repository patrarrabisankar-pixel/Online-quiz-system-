const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await connection.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, fullName, 'user']
    );
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      email,
      fullName,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    connection.release();
    
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(users[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
