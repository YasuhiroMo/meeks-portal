import { useState, useEffect, useRef } from 'react';
import { KNOWLEDGE_BASE, INITIAL_MESSAGE, SUGGESTIONS } from '../data/chatKnowledge';
import { AI_MODEL } from '../utils/constants';

export default function Chatbot() {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: INITIAL_MESSAGE }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const btm = useRef(null);

  useEffect(() => { btm.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    const nm = [...msgs, { role: "user", content: q }];
    setMsgs(nm);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 1000,
          system: KNOWLEDGE_BASE,
          messages: nm.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      setMsgs(p => [...p, {
        role: "assistant",
        content: data.content?.find(c => c.type === "text")?.text || "申し訳ありません。もう一度お試しください。"
      }]);
    } catch (e) {
      setMsgs(p => [...p, { role: "assistant", content: "エラーが発生しました。しばらく経ってからお試しください。" }]);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: "0 auto", padding: "20px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* ヘッダー */}
      <div style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: "16px 20px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6C3483,#8E44AD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2d4a" }}>物流部 AIアシスタント</div>
          <div style={{ fontSize: 11, color: "#27AE60" }}>● 手順書・教育資料・緊急連絡先を学習済み</div>
        </div>
      </div>

      {/* メッセージ欄 */}
      <div style={{ flex: 1, overflowY: "auto", background: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6C3483,#8E44AD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, alignSelf: "flex-end" }}>🤖</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "12px 16px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "linear-gradient(135deg,#1B4F72,#2E86C1)" : "#f0f4f8",
              color: m.role === "user" ? "#fff" : "#333", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap"
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6C3483,#8E44AD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <div style={{ background: "#f0f4f8", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", fontSize: 13, color: "#888" }}>考えています...</div>
          </div>
        )}
        <div ref={btm} />
      </div>

      {/* サジェスト */}
      <div style={{ background: "#f8f9fa", padding: "10px 12px", borderTop: "1px solid #e8e8e8", overflowX: "auto", whiteSpace: "nowrap", display: "flex", gap: 6 }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            style={{ display: "inline-block", padding: "6px 14px", borderRadius: 20, border: "1px solid #2E86C1", background: "#fff", color: "#2E86C1", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap", transition: "all .15s" }}
            onMouseEnter={e => { e.target.style.background = "#2E86C1"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = "#2E86C1"; }}>
            {s}
          </button>
        ))}
      </div>

      {/* 入力欄 */}
      <div style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "12px", borderTop: "1px solid #e0e0e0", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="質問を入力してください..."
          style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "1.5px solid #ddd", fontSize: 13, outline: "none" }} />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: input.trim() && !loading ? "linear-gradient(135deg,#1B4F72,#2E86C1)" : "#ccc", color: "#fff", cursor: input.trim() && !loading ? "pointer" : "default", fontSize: 13, fontWeight: 700, transition: "all .2s" }}>
          送信
        </button>
      </div>
    </div>
  );
}