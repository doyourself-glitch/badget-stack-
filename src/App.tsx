import { useState, useEffect } from 'react';
import './App.css';

/**
 * Budget Stack - 予算管理アプリ
 */
export default function App() {
  type ExpenseLog = {
    id: number;
    amount: number;
    time: string;
    category: string;
  };

  type DailySummary = {
    date: string;
    totalSpent: number;
    categoryTotals: { category: string; amount: number }[];
  };

  const today = new Date().toDateString();

  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'settings'>('home');

  const [historicalData, setHistoricalData] = useState<DailySummary[]>(() => {
    const saved = localStorage.getItem('budget-historical-data');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>(() => {
    const lastAccess = localStorage.getItem('budget-last-access');
    if (lastAccess && lastAccess !== today) return [];
    
    const saved = localStorage.getItem('budget-expense-logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('budget-daily-goal');
    return saved ? JSON.parse(saved) : 3000;
  });

  const [todaySpent, setTodaySpent] = useState<number>(() => {
    const lastAccess = localStorage.getItem('budget-last-access');
    if (lastAccess && lastAccess !== today) return 0;
    
    const saved = localStorage.getItem('budget-today-spent');
    return saved ? JSON.parse(saved) : 0;
  });

  const [expenseInput, setExpenseInput] = useState<string>('');

  const CATEGORIES = ['食費', '外食費', 'デート', '生活費', '固定費'];
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);

  useEffect(() => {
    localStorage.setItem('budget-last-access', today);
  }, [today]);

  useEffect(() => {
    localStorage.setItem('budget-daily-goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('budget-today-spent', JSON.stringify(todaySpent));
  }, [todaySpent]);

  useEffect(() => {
    localStorage.setItem('budget-expense-logs', JSON.stringify(expenseLogs));
  }, [expenseLogs]);

  useEffect(() => {
    console.log("Historical Data:", historicalData); // ← これがあることで「使っている」とみなされる
    localStorage.setItem('budget-historical-data', JSON.stringify(historicalData));
  }, [historicalData]);

  const handleAddExpense = () => {
    const amount = Number(expenseInput);
    if (isNaN(amount) || amount <= 0) return;

    const newLog: ExpenseLog = {
      id: Date.now(),
      amount: amount,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      category: selectedCategory
    };

    setExpenseLogs((prev: ExpenseLog[]) => [newLog, ...prev]);
    setTodaySpent((prev: number) => prev + amount);
    setExpenseInput('');

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleResetDay = () => {
    if (window.confirm('今日の結果を確定してリセットしますか？')) {
      const currentCategoryTotals = CATEGORIES.map(cat => {
        const amount = expenseLogs
          .filter(log => log.category === cat)
          .reduce((sum, log) => sum + log.amount, 0);
        return { category: cat, amount };
      }).filter(item => item.amount > 0);

      if (todaySpent > 0) {
        const newSummary: DailySummary = {
          date: today,
          totalSpent: todaySpent,
          categoryTotals: currentCategoryTotals
        };

        setHistoricalData(prev => {
          const filtered = prev.filter(d => d.date !== today);
          return [newSummary, ...filtered];
        });
      }

      setTodaySpent(0);
      setExpenseLogs([]);
      setActiveTab('home');
    }
  };
  
  const handleDeleteLog = (idToDelete: number, amountToSubtract: number) => {
      setExpenseLogs((prev: ExpenseLog[]) => prev.filter(log => log.id !== idToDelete));
      setTodaySpent((prev: number) => Math.max(0, prev - amountToSubtract));
  };

  const todayMargin = Math.max(0, dailyGoal - todaySpent);
  const progress = Math.min((todaySpent / dailyGoal) * 100, 100);

  const categoryTotals = CATEGORIES.map(cat => {
    const amount = expenseLogs
      .filter(log => log.category === cat)
      .reduce((sum, log) => sum + log.amount, 0);
    const percent = (amount / dailyGoal) * 100;
    return { category: cat, amount, percent };
  }).filter(item => item.amount > 0); 

  return (
    <div className="container">
      <header>
        <h1>Budget Stack</h1>
      </header>

      <main className="view-area">
        {/* ==============================
            1. HOME VIEW (入力と今日のログ)
        ============================== */}
        {activeTab === 'home' && (
          <div className="fade-in">
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
          </div>
        )}
        
        {/* ==============================
            2. ANALYTICS VIEW
        ============================== */}
        {activeTab === 'analytics' && (
          <div className="fade-in">
            {expenseLogs.length > 0 && (
              <section className="card chart-section">
                <p className="section-label text-center">Today's Breakdown</p>
                <div className="progress-container">
                  <div className="progress-bar stacked-bar">
                    {categoryTotals.map((item) => (
                      <div
                        key={item.category}
                        className="progress-fill"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: `var(--color-cat-${CATEGORIES.indexOf(item.category) + 1})`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="chart-legend">
                  {categoryTotals.map((item) => (
                    <div key={item.category} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: `var(--color-cat-${CATEGORIES.indexOf(item.category) + 1})`}}></span>
                      <span className="legend-label">{item.category}</span>
                      <span className="legend-amount">¥{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="card log-section">
              <p className="section-label text-center">History</p>
              {historicalData.length > 0 ? (
                <ul className="log-list">
                  {historicalData.map((day) => {
                    const d = new Date(day.date);
                    const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;
                    return (
                      <li key={day.date} className="log-item">
                        <div className="log-info">
                          <span className="log-category" style={{ fontSize: '0.85rem' }}>{shortDate}</span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {day.categoryTotals.map(cat => (
                              <span key={cat.category} style={{ fontSize: '0.65rem', color: 'var(--color-text-sub)', background: 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                                {cat.category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="log-meta">
                          <span className="log-amount" style={{ color: 'var(--color-text-main)'}}>
                              ¥{day.totalSpent.toLocaleString()}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="empty-state">No records yet.</p>
              )}
            </section>
          </div>
        )}

        {/* ==============================
            3. SETTINGS VIEW 
        ============================== */}
        {activeTab === 'settings' && (
          <div className="fade-in">
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

            <button className="card btn-reset" onClick={handleResetDay}>
              End of Day (Reset)
            </button>
          </div>
        )}
      </main>

      {/* ==============================
          BOTTOM NAVIGATION
      ============================== */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </button>
        <button 
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Analytics
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Settings
        </button>
      </nav>
    </div>
  );
}