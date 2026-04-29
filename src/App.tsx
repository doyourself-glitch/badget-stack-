import { useState, useEffect } from 'react';
import './App.css';

/**
 * Budget Stack - 予算管理アプリ
 */
export default function App() {
  // ログ追加
  type ExpenseLog = {
    id: number;
    amount: number;
    time: string;
  };

  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>(() => {
    const saved = localStorage.getItem('budget-expense-Logs');
    return saved? JSON.parse(saved) : [];
  })

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

  // ローカルストレージに
  useEffect(() => {
    localStorage.setItem('budget-expense-logs' , JSON.stringify(expenseLogs));
  }, [expenseLogs]);

  // 支出の追加処理
  const handleAddExpense = () => {
    const amount = Number(expenseInput);
    if (isNaN(amount) || amount <= 0) return;

    const newLog: ExpenseLog = {
      id: Date.now(),
      amount: amount,
      time: new Date().toLocaleTimeString('ja-JP' , { hour: '2-digit', minute: '2-digit'})
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

        // 支出入力
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

        {expenseLogs.length > 0 && (
          <section className="glass" style={{ borderRadius: '24px', padding: '16px', marginBottom: '20px' }}>
            <p style ={{ fontSize:'10px' , fontWeight: 'bold' , color: '#86868b' , textTransform: 'uppercase' , letterSpacing: '0.1em' , textAlign: 'center' , margin: '0 0 12px 0' }}>
              Today's Logs
            </p>
            <ul style={{ listStyle: 'none' , padding: 0, margin: 0, maxHeight: '160px', overflowY: 'auto'}}>
              {expenseLogs.map((log) => (
                <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid rgba(0,0,0,0.05' }}>
                  <span style={{ fontWeight: 'bold' , fontSize: '1rem' }}>¥{log.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#86868b' }}>{log.time}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        
        // １日終了
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