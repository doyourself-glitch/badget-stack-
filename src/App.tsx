import { useState } from 'react';
import './App.css';

export default function App() {
  // 1日の上限予算
  const DAILY_BUDGET = 3000;
  
  const [todaySpent, setTodaySpent] = useState(0);
  const [expenseInput, setExpenseInput] = useState('');
  const [totalAssets, setTotalAssets] = useState(0);

  // 支出を追加（Enterキー対応も考慮）
  const handleAddExpense = () => {
    const amount = Number(expenseInput);
    if (isNaN(amount) || amount <= 0) return;
    
    setTodaySpent(prev => prev + amount);
    setExpenseInput('');
  };

  // 1日を確定させて積み上げる
  const handleStack = () => {
    const remaining = Math.max(0, DAILY_BUDGET - todaySpent);
    setTotalAssets(prev => prev + remaining);
    setTodaySpent(0);
  };

  const remaining = Math.max(0, DAILY_BUDGET - todaySpent);

  return (
    <div className="container">
      <div className="header">
        <h1>Budget Stack</h1>
        <p className="total-label">Total Assets</p>
        <h2 className="total-value">¥{totalAssets.toLocaleString()}</h2>
      </div>

      <div className="card">
        <p>Today's Remaining</p>
        <h1 className="remaining-value">¥{remaining.toLocaleString()}</h1>
      </div>

      <div className="input-group">
        <input 
          type="number" 
          placeholder="Amount (¥)" 
          value={expenseInput}
          onChange={(e) => setExpenseInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
        />
        <button onClick={handleAddExpense} className="add-btn">Add</button>
      </div>

      <button onClick={handleStack} className="stack-btn">
        End of Day: Stack Savings
      </button>
    </div>
  );
}