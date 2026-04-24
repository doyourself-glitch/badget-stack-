import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  // 1日の目標額
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('budget-daily-goal');
    return saved ? JSON.parse(saved) : 3000;
  });

  const [todaySpent, setTodaySpent] = useState<number>(0);
  const [expenseInput, setExpenseInput] = useState<string>('');

  // 予算設定の保存
  useEffect(() => {
    localStorage.setItem('budget-daily-goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  // 支出記録
  const handleAddExpense = () => {
    const amount = Number(expenseInput);
    if (isNaN(amount) || amount <= 0) return;
    setTodaySpent((prev) => prev + amount);
    setExpenseInput('');
  };

  // 1日の締めくくり（リセット）
  const handleResetDay = () => {
    if (confirm('今日の結果を確定してリセットしますか？')) {
      setTodaySpent(0);
    }
  };

  const todayMargin = Math.max(0, dailyGoal - todaySpent);

  return (
    <div className="container">
      <header>
        <h1>Budget Stack</h1>
      </header>

      <main>
        {/* 今日の主人公：Margin */}
        <section className="hero">
          <p>Today's Margin</p>
          <h1 className="margin-value">¥{todayMargin.toLocaleString()}</h1>
        </section>

        {/* 支出入力 */}
        <div className="input-group">
          <input 
            type="text" 
            inputMode="numeric"
            pattern="[0-9]"
            placeholder="Spend (¥)" 
            value={expenseInput}
            onChange={(e) => setExpenseInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
          />
          <button onClick={handleAddExpense}>Add</button>
        </div>

        {/* リセットボタン */}
        <button className="reset-btn" onClick={handleResetDay}>
          End of Day
        </button>

        {/* 設定エリア */}
        <section className="settings">
          <label>Daily Goal: </label>
          <input 
            type="number" 
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
          />
        </section>
      </main>
    </div>
  );
}