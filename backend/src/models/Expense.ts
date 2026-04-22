import mongoose from 'mongoose';

export interface IExpense {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
}

const expenseSchema = new mongoose.Schema<IExpense>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Other']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Expense = mongoose.model('Expense', expenseSchema);