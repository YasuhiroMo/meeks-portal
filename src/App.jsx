import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import ManualViewer from './components/ManualViewer';
import ELearning from './components/ELearning';
import Chatbot from './components/Chatbot';
import Admin from './components/Admin';
import Login from './components/Login';

export default function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);

  // ページ読み込み時にセッションを確認
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('meeks_user');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) { /* ignore */ }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setTab('home');
    sessionStorage.removeItem('meeks_user');
  };

  // 未ログインの場合 → ログイン画面を表示
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Helvetica Neue',Arial,'Hiragino Sans',sans-serif" }}>
      <Header tab={tab} setTab={t => { setTab(t); window.scrollTo(0, 0); }} user={user} onLogout={handleLogout} />
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        {tab === 'home' && <Home setTab={setTab} user={user} />}
        {tab === 'manual' && <ManualViewer />}
        {tab === 'elearning' && <ELearning user={user} setUser={setUser} />}
        {tab === 'chat' && <Chatbot />}
        {tab === 'admin' && <Admin />}
      </main>
    </div>
  );
}