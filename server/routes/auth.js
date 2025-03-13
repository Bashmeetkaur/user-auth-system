// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Todo = require('../models/Todo');
const { body, validationResult } = require('express-validator');


// Register (unchanged)
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({
      username,
      email,
      password: await hashPassword(password),
      role: role || 'user',
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login (unchanged)
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Dashboard (unchanged)
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ 
    msg: 'Welcome to the dashboard', 
    user: { id: req.user.id, role: req.user.role, username: req.user.username } 
  });
});

// Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit user (admin only)
router.put('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, role } = req.body;
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (username) user.username = username;
    if (role && ['user', 'admin'].includes(role)) user.role = role;

    await user.save();
    res.json({ msg: 'User updated', user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    await user.deleteOne();
    res.json({ msg: 'User deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/reset-password-request', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours (was 1 hour)
    await user.save();
    console.log(`Token generated and saved for user ${email}: ${token}, Expires: ${user.resetPasswordExpires}`);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) requested a password reset.\n\n
      Please click the following link to reset your password:\n\n
      http://localhost:5173/reset-password/${token}\n\n
      If you did not request this, ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Password reset email sent' });
  } catch (error) {
    console.error('Nodemailer error:', error); // Add this line here
    res.status(500).json({ msg: 'Server error' , error: error.message });
  }
});

router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { token } = req.params;
  const { password } = req.body;

  try {
    console.log('Received token for reset:', token);
    console.log('Current time:', new Date());
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log('Found user:', user);
    if (user) {
      console.log('Token in DB:', user.resetPasswordToken, 'Expires:', user.resetPasswordExpires);
    }

    if (!user) {
      console.log('Token validation failed: Invalid or expired');
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.log(`Password reset successful for user: ${user.email}`);
    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Changed Successfully',
        text: `Hello,\n\nThis is a confirmation that your password for the account ${user.email} has been successfully changed on ${new Date().toLocaleString()}.\n\nIf you did not initiate this change, please contact our support team immediately.\n\nBest regards,\nUser Authentication Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password change confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending password change confirmation email:', emailError);
      // Optionally log this to a file or monitoring system, but don't affect the response
    }

    res.json({ msg: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Create todo
router.post('/todos', authMiddleware, async (req, res) => {
  const { text } = req.body;
  try {
    const todo = new Todo({ userId: req.user.id, text });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's todos
router.get('/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update todo
router.put('/todos/:todoId', authMiddleware, async (req, res) => {
  const { text, completed } = req.body;
  const { todoId } = req.params;

  try {
    const todo = await Todo.findOne({ _id: todoId, userId: req.user.id });
    if (!todo) return res.status(404).json({ msg: 'Todo not found' });

    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete todo
router.delete('/todos/:todoId', authMiddleware, async (req, res) => {
  const { todoId } = req.params;

  try {
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId: req.user.id });
    if (!todo) return res.status(404).json({ msg: 'Todo not found' });
    res.json({ msg: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;