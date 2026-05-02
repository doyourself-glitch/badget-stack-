import { useState, useEffect } from 'react';
import './App.css';

/**
 * Budget Stack - 予算管理アプリ
 */
export default function App() {
  // ログの型定義（カテゴリーを追加）
  type ExpenseLog = {
    id: number;
    amount: number;
    time: string;
    category: string;
  };

  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>(() => {
    const saved = localStorage.getItem('budget-expense-logs');
    return saved ? JSON.parse(saved) : [];
  });

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

  // カテゴリーの定義と選択状態（タイポ修正済み）
  const CATEGORIES = ['食費', '外食費', 'デート', '生活費', '固定費'];
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);

  // 予算設定の自動保存
  useEffect(() => {
    localStorage.setItem('budget-daily-goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  // 支出記録の自動保存
  useEffect(() => {
    localStorage.setItem('budget-today-spent', JSON.stringify(todaySpent));
  }, [todaySpent]);

  // ログの自動保存
  useEffect(() => {
    localStorage.setItem('budget-expense-logs', JSON.stringify(expenseLogs));
  }, [expenseLogs]);

  // 支出の追加処理
  const handleAddExpense = () => {
    const amount = Number(expenseInput);
    if (isNaN(amount) || amount <= 0) return;

    // 新しいログの作成（カンマの抜け落ちとカテゴリーを追加）
    const newLog: ExpenseLog = {
      id: Date.now(),
      amount: amount,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      category: selectedCategory
    };

    setExpenseLogs((prev: ExpenseLog[]) => [newLog, ...prev]);
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
      setExpenseLogs([]);
    }
  };
  
  const handleDeleteLog = (idToDelete: number, amountToSubtract: number) => {
      setExpenseLogs((prev: ExpenseLog[]) => prev.filter(log => log.id !==idToDelete));
      setTodaySpent((prev: number) => Math.max(0, prev - amountToSubtract));
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
        <section className="card hero">
          <p className="section-label">Today's Margin</p>
          <h2 className="margin-value">¥{todayMargin.toLocaleString()}</h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

       <section className="card input-section">
          <div className="category-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="input-row">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Spend (¥)"
              value={expenseInput}
              onChange={(e) => setExpenseInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
            />
            <button className="btn-primary" onClick={handleAddExpense}>Add</button>
          </div>
        </section>

        {/* Logs Section */}
        {expenseLogs.length > 0 && (
          <section className="card log-section">
            <p className="section-label text-center">Today's Logs</p>
            <ul className="log-list">
              {expenseLogs.map((log) => (
                <li key={log.id} className="log-item">
                  <div className="log-info">
                    <span className="log-amount">¥{log.amount.toLocaleString()}</span>
                    <span className="log-category">{log.category}</span>
                  </div>
                  <div className="log-meta">
                    <span className="log-time">{log.time}</span>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteLog(log.id, log.amount)}
                      title="Delete log"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        
        <button className="card btn-reset" onClick={handleResetDay}>
          End of Day
        </button>

        {/* Settings Section */}
        <section className="card settings">
          <label className="settings-label">Daily Goal:</label>
          <div className="settings-input-wrapper">
            <span className="currency-symbol">¥</span>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
          </div>
        </section>
      </main>
    </div>
  );
}