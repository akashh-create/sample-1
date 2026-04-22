import { Router } from 'express';
import { Expense } from '../models/Expense.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /expense - Add new expense (Protected route)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date
    } = req.body;
    if (!title || !amount || !category) {
      return res.status(400).json({
        error: 'Title, amount, and category are required'
      });
    }
    const expense = new Expense({
      userId: req.userId,
      title,
      amount,
      category,
      date: date || new Date()
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// GET /expenses - Get all expenses of logged-in user
router.get('/', async (req, res) => {
  try {
    const {
      category
    } = req.query;
    const query = {
      userId: req.userId
    };

    // Optional: Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    const expenses = await Expense.find(query).sort({
      date: -1
    });

    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    res.json({
      expenses,
      total
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// GET /expenses/:id - Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// PUT /expenses/:id - Update expense
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date
    } = req.body;
    const expense = await Expense.findOneAndUpdate({
      _id: req.params.id,
      userId: req.userId
    }, {
      title,
      amount,
      category,
      date
    }, {
      new: true
    });
    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// DELETE /expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    res.json({
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
});
export default router;