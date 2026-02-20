import { useState } from 'react';
import { MANUALS } from '../data/manuals';

export default function ManualViewer() {
  const [sel, setSel] = useState(null);
  const [si, setSI] = useState(0);
  const m = sel ? MANUALS.find(x => x.id === sel) : null;

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: sel ? "280px 1fr" : "1fr", gap: 20 }}>
      {/* 手順書一覧 */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1a2d4a", marginBottom: 16 }}>📄 手順書一覧</h2>
        {MANUALS.map(mn => (
          <div key={mn.id} onClick={() => { setSel(mn.id); setSI(0); }}
            style={{ background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 10, cursor: "pointer", border: sel === mn.id ? `2px solid ${mn.color}` : "1px solid #e8e8e8", boxShadow: sel === mn.id ? "0 4px 16px rgba(0,0,0,0.08)" : "none", transition: "all .2s" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{mn.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2d4a", marginBottom: 4 }}>{mn.title}</div>
            <div style={{ fontSize: 10, background: mn.color, color: "#fff", display: "inline-block", padding: "2px 8px", borderRadius: 10 }}>{mn.tag}</div>
          </div>
        ))}
      </div>

      {/* コンテンツ表示 */}
      {m && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e0e0e0", overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg,${m.color},${m.color}cc)`, color: "#fff", padding: "20px 24px" }}>
            <span style={{ fontSize: 28 }}>{m.icon}</span>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>{m.title}</h2>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{m.tag}</div>
          </div>
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e0e0e0", overflowX: "auto" }}>
            {m.sections.map((s, i) => (
              <button key={i} onClick={() => setSI(i)} style={{
                padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap",
                fontWeight: si === i ? 700 : 400, color: si === i ? m.color : "#666",
                borderBottom: si === i ? `2px solid ${m.color}` : "2px solid transparent"
              }}>{s.title}</button>
            ))}
          </div>
          <div style={{ padding: "24px", whiteSpace: "pre-line", fontSize: 13, lineHeight: 2, color: "#333" }}>
            {m.sections[si].content}
          </div>
        </div>
      )}

      {!sel && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#aaa", fontSize: 14 }}>← 手順書を選択してください</div>}
    </div>
  );
}