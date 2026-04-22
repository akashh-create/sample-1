import { Router } from 'express';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
const router = Router();

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });
    await user.save();
    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// POST /login - Authenticate user and return JWT token
router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      email
    });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign({
      userId: user._id
    }, JWT_SECRET, {
      expiresIn: '7d'
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});
export default router;