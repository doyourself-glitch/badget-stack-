import { useState, useEffect } from 'react';
import './App.css';

/**
 * Budget Stack - 予算管理アプリ
 */
export default function App() {
  // 1日の目標額の状態管理
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('budget-daily-goal');
    return saved ? JSON.parse(saved) : 3000;
  });

  // 今日の支出額の状態管理
  const [todaySpent, setTodaySpent] = useState<number>(() => {
    const saved = localStorage.getItem('budget-today-spent');
    return saved ? JSON.parse(saved) : 0;
  });

  const [expenseInput, setExpenseInput] = useState<string>('');

  // 予算設定の自動保存
  useEffect(() => {
    localStorage.setItem('budget-daily-goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  // 支出記録の自動保存
  useEffect(() => {
    localStorage.setItem('budget-today-spent', JSON.stringify(todaySpent));
  }, [todaySpent]);

  // 支出の追加処理
  const handleAddExpense = () => {
    const amount = Number(expenseInput);
    if (isNaN(amount) || amount <= 0) return;

    setTodaySpent((prev: number) => prev + amount);
    setExpenseInput('');

    // 触覚フィードバック
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // 1日のリセット処理
  const handleResetDay = () => {
    if (window.confirm('今日の結果を確定してリセットしますか？')) {
      setTodaySpent(0);
    }
  };

  // 残り予算とプログレスバーの計算
  const todayMargin = Math.max(0, dailyGoal - todaySpent);
  const progress = Math.min((todaySpent / dailyGoal) * 100, 100);

  return (
    <div className="container">
      <header>
        <h1>Budget Stack</h1>
      </header>

      <main>
        <section className="hero">
          <p>Today's Margin</p>
          <h2 className="margin-value">¥{todayMargin.toLocaleString()}</h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <div className="input-group">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Spend (¥)"
            value={expenseInput}
            onChange={(e) => setExpenseInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
          />
          <button onClick={handleAddExpense}>Add</button>
        </div>

        <button className="reset-btn" onClick={handleResetDay}>
          End of Day
        </button>

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