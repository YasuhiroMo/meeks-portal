import { useState, useRef } from 'react';
import COURSES from '../data/courses';
import { PASS_RATE } from '../utils/constants';

export default function CourseView({ cid, prog, onBack, onDone }) {
  const c = COURSES.find(x => x.id === cid);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState("learn");
  const [ans, setAns] = useState({});
  const [sub, setSub] = useState(false);
  const [sc, setSc] = useState(0);
  const ref = useRef(null);

  const p = prog[cid] || {};
  const passCount = Math.ceil(c.quiz.length * PASS_RATE);
  const passed = sub && sc >= passCount;

  const submit = () => {
    let s = 0;
    c.quiz.forEach((q, i) => { if (ans[i] === q.a) s++; });
    setSc(s);
    setSub(true);
    onDone(cid, s, s >= passCount);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={ref} style={{ maxWidth: 800, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#2E86C1", cursor: "pointer", fontSize: 13, padding: "0 0 16px" }}>← コース一覧に戻る</button>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e0e0e0" }}>
        {/* ヘッダー */}
        <div style={{ background: `linear-gradient(135deg,${c.color},${c.color}bb)`, color: "#fff", padding: "20px 24px" }}>
          <span style={{ fontSize: 28 }}>{c.icon}</span>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>{c.title}</h2>
        </div>

        {/* タブ切替 */}
        <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0" }}>
          {["learn", "quiz"].map(m => (
            <button key={m} onClick={() => { setMode(m); setSub(false); setAns({}); }} style={{
              flex: 1, padding: "12px", border: "none", background: "none", cursor: "pointer", fontSize: 13,
              fontWeight: mode === m ? 700 : 400, color: mode === m ? c.color : "#666",
              borderBottom: mode === m ? `2px solid ${c.color}` : "2px solid transparent"
            }}>{m === "learn" ? "📖 学習する" : "📝 確認テスト"}{p.completed && m === "quiz" ? " ✔" : ""}</button>
          ))}
        </div>

        {/* 学習モード */}
        {mode === "learn" && (
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {c.secs.map((_, i) => <div key={i} onClick={() => setSec(i)} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= sec ? c.color : "#e0e0e0", cursor: "pointer", transition: "all .2s" }} />)}
            </div>
            <div style={{ fontSize: 11, color: c.color, fontWeight: 700, marginBottom: 4 }}>セクション {sec + 1}/{c.secs.length}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2d4a", marginBottom: 14 }}>{c.secs[sec].title}</h3>
            <div style={{ fontSize: 13, lineHeight: 2, color: "#333", whiteSpace: "pre-line" }}>{c.secs[sec].body}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setSec(Math.max(0, sec - 1))} disabled={sec === 0}
                style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: sec === 0 ? "default" : "pointer", opacity: sec === 0 ? .4 : 1, fontSize: 12 }}>← 前へ</button>
              {sec < c.secs.length - 1
                ? <button onClick={() => setSec(sec + 1)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: c.color, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>次へ →</button>
                : <button onClick={() => setMode("quiz")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: c.color, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>テストへ →</button>
              }
            </div>
          </div>
        )}

        {/* テストモード */}
        {mode === "quiz" && (
          <div style={{ padding: "24px" }}>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{c.quiz.length}問・合格ライン：{passCount}問以上（80%）</p>

            {sub && (
              <div style={{ background: passed ? "rgba(39,174,96,0.06)" : "rgba(231,76,60,0.06)", border: `2px solid ${passed ? "#27AE60" : "#E74C3C"}`, borderRadius: 12, padding: "16px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{passed ? "🎉" : "📚"}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: passed ? "#27AE60" : "#E74C3C" }}>{passed ? "合格！" : "不合格 — 再学習してください"}</div>
                <div style={{ fontSize: 13, marginTop: 4, color: "#555" }}>{sc}/{c.quiz.length}問正解（{Math.round(sc / c.quiz.length * 100)}%）</div>
              </div>
            )}

            {c.quiz.map((q, qi) => (
              <div key={qi} style={{ background: "#f9f9f9", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2d4a", marginBottom: 10 }}>Q{qi + 1}. {q.q}</div>
                {q.o.map((opt, oi) => {
                  const sel = ans[qi] === oi;
                  const ok = sub && oi === q.a;
                  const ng = sub && sel && oi !== q.a;
                  return (
                    <div key={oi} onClick={() => !sub && setAns(p => ({ ...p, [qi]: oi }))}
                      style={{ padding: "9px 12px", borderRadius: 8, marginBottom: 6, fontSize: 13, cursor: sub ? "default" : "pointer",
                        border: `1.5px solid ${ok ? "#27AE60" : ng ? "#E74C3C" : sel ? "#2E86C1" : "#e0e0e0"}`,
                        background: ok ? "rgba(39,174,96,0.05)" : ng ? "rgba(231,76,60,0.05)" : sel ? "rgba(46,134,193,0.05)" : "#fff",
                        display: "flex", alignItems: "center", gap: 8, transition: "all .15s" }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${ok ? "#27AE60" : ng ? "#E74C3C" : sel ? "#2E86C1" : "#ccc"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                        color: ok ? "#27AE60" : ng ? "#E74C3C" : sel ? "#2E86C1" : "#999", flexShrink: 0 }}>
                        {ok ? "✔" : ng ? "✗" : sel ? "●" : ""}
                      </span>{opt}
                    </div>
                  );
                })}
              </div>
            ))}

            {!sub && (
              <button onClick={submit} disabled={Object.keys(ans).length !== c.quiz.length}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none",
                  background: Object.keys(ans).length === c.quiz.length ? c.color : "#ccc",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: Object.keys(ans).length === c.quiz.length ? "pointer" : "default", marginTop: 8 }}>
                テストを提出する
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}