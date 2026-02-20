import { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import ManualViewer from './components/ManualViewer';
import ELearning from './components/ELearning';
import Chatbot from './components/Chatbot';
import Admin from './components/Admin';

export default function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);

  const changeTab = (t) => {
    setTab(t);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setUser(null);
    setTab('home');
  };

  return (
    <div>
      <Header tab={tab} setTab={changeTab} user={user} onLogout={handleLogout} />
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        {tab === 'home' && <Home setTab={changeTab} user={user} />}
        {tab === 'manual' && <ManualViewer />}
        {tab === 'elearning' && <ELearning user={user} setUser={setUser} />}
        {tab === 'chat' && <Chatbot />}
        {tab === 'admin' && <Admin />}
      </main>
    </div>
  );
}