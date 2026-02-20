import { useState } from 'react';

// ※ 社内共通パスワード（変更する場合はここを書き換え）
const COMPANY_PASSWORD = "meeks2025";

export default function Login({ onLogin }) {
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!empId.trim() || !name.trim()) {
      setError('社員番号と氏名を入力してください');
      return;
    }
    if (password !== COMPANY_PASSWORD) {
      setError('パスワードが違います');
      return;
    }
    // ログイン成功 → セッションに保存
    const user = { empId: empId.trim(), name: name.trim() };
    sessionStorage.setItem('meeks_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2d4a 50%, #0d1b2a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Helvetica Neue',Arial,'Hiragino Sans',sans-serif"
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 36px',
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚚</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a2d4a', marginBottom: 6 }}>
            メークス物流事業部
          </h1>
          <p style={{ fontSize: 13, color: '#888' }}>統合ポータルシステム</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              社員番号
            </label>
            <input
              value={empId}
              onChange={e => { setEmpId(e.target.value); setError(''); }}
              placeholder="例: D001"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #ddd', fontSize: 14, outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2E86C1'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              氏名
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="例: 山田太郎"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #ddd', fontSize: 14, outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2E86C1'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="社内共通パスワード"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #ddd', fontSize: 14, outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2E86C1'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {error && (
            <div style={{
              background: '#ffeaea', color: '#c0392b', padding: '10px 14px',
              borderRadius: 8, fontSize: 13, textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #1B4F72, #2E86C1)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              marginTop: 8, transition: 'opacity .2s'
            }}
            onMouseEnter={e => e.target.style.opacity = 0.9}
            onMouseLeave={e => e.target.style.opacity = 1}
          >
            ログイン
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 24 }}>
          ※ 社内関係者のみアクセス可能です
        </p>
      </div>
    </div>
  );
}