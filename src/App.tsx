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
        <section className="hero">
          <p>Today's Margin</p>
          <h2 className="margin-value">¥{todayMargin.toLocaleString()}</h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        {/* ▼▼▼ ここからが修正ポイント3の画面UIです ▼▼▼ */}
        <div className="input-group" style={{ flexDirection: 'column' }}>
          {/* カテゴリー選択ボタンの横並び */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? '#000' : 'rgba(0,0,0,0.05)',
                  color: selectedCategory === cat ? '#fff' : '#86868b',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 今までの金額入力とAddボタン */}
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
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
        </div>

        {expenseLogs.length > 0 && (
          <section className="glass" style={{ borderRadius: '24px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', margin: '0 0 12px 0' }}>
              Today's Logs
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '160px', overflowY: 'auto' }}>
              {expenseLogs.map((log) => (
                <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>¥{log.amount.toLocaleString()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#86868b' }}>{log.category}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#86868b' }}>{log.time}</span>
                    <button 
                      onClick={() => handleDeleteLog(log.id, log.amount)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#ff3b30', 
                        fontSize: '14px', 
                        cursor: 'pointer', 
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="この記録を削除"
                    >
                      ✖
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          </section>
        )}
        
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