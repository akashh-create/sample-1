import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';









const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Other'];

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchExpenses();
  }, [token, category, navigate]);

  const fetchExpenses = async () => {
    try {
      const url = category === 'All' ?
      'http://localhost:3001/api/expenses' :
      `http://localhost:3001/api/expenses?category=${category}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const data = await res.json();
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId ?
    `http://localhost:3001/api/expenses/${editingId}` :
    'http://localhost:3001/api/expenses';

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date
        })
      });

      if (res.ok) {
        setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
        setShowForm(false);
        setEditingId(null);
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setEditingId(expense._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;

    try {
      await fetch(`http://localhost:3001/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelEdit = () => {
    setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Expense Manager</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p className="total-amount">${total.toFixed(2)}</p>
        </div>

        <div className="controls">
          <button onClick={() => setShowForm(!showForm)} className="add-btn">
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-filter">
            
            {CATEGORIES.map((cat) =>
            <option key={cat} value={cat}>{cat}</option>
            )}
          </select>
        </div>

        {showForm &&
        <div className="expense-form">
            <h3>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit}>
              <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required />
            
              <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              step="0.01"
              min="0"
              required />
            
              <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              
                {CATEGORIES.filter((c) => c !== 'All').map((cat) =>
              <option key={cat} value={cat}>{cat}</option>
              )}
              </select>
              <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required />
            
              <button type="submit">{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" onClick={cancelEdit} className="cancel-btn">Cancel</button>}
            </form>
          </div>
        }

        <div className="expense-list">
          <h3>Your Expenses {category !== 'All' && `(${category})`}</h3>
          {expenses.length === 0 ?
          <p className="no-data">No expenses found</p> :

          <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) =>
              <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.title}</td>
                    <td><span className={`category-tag ${expense.category.toLowerCase()}`}>{expense.category}</span></td>
                    <td className="amount">${expense.amount.toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleEdit(expense)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDelete(expense._id)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>);

};

export default Dashboard;