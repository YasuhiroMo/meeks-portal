import { useState } from 'react';

export default function ELLogin({ onLogin }) {
  const [eid, setEid] = useState("");
  const [nm, setNm] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    if (eid.trim() && nm.trim()) {
      onLogin({ empId: eid.trim(), name: nm.trim() });
    } else {
      setErr("社員番号と氏名を入力してください");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", background: "#fff", borderRadius: 18, padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a2d4a", marginBottom: 24, textAlign: "center" }}>🎓 Eラーニング ログイン</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>社員番号</label>
        <input value={eid} onChange={e => { setEid(e.target.value); setErr(""); }} placeholder="例: M-0012"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none" }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>氏名</label>
        <input value={nm} onChange={e => { setNm(e.target.value); setErr(""); }} placeholder="例: 田中太郎"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none" }}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />
      </div>
      {err && <div style={{ color: "#E74C3C", fontSize: 12, marginBottom: 10, textAlign: "center" }}>{err}</div>}
      <button onClick={handleLogin}
        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1B4F72,#2E86C1)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        受講を開始する
      </button>
    </div>
  );
}