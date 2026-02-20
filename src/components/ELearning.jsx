import { useState, useEffect, useCallback } from 'react';
import COURSES, { TOTAL_COURSES } from '../data/courses';
import stor from '../utils/storage';
import ELLogin from './ELLogin';
import CourseView from './CourseView';

export default function ELearning({ user, setUser }) {
  const [selC, setSelC] = useState(null);
  const [prog, setProg] = useState({});
  const [loaded, setLoaded] = useState(false);

  // 進捗読み込み
  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    (async () => {
      try {
        const r = await stor.get("prog:" + user.empId);
        if (r?.value) setProg(JSON.parse(r.value));
      } catch (e) { /* empty */ }
      setLoaded(true);
    })();
  }, [user]);

  // 進捗保存
  const saveProg = useCallback(async (np) => {
    setProg(np);
    if (user) try { await stor.set("prog:" + user.empId, JSON.stringify(np)); } catch (e) { /* empty */ }
  }, [user]);

  // 結果保存
  const saveRes = useCallback(async (cid, sc, pa) => {
    if (!user) return;
    const c = COURSES.find(x => x.id === cid);
    try {
      await stor.set(
        "res:" + user.empId + ":" + cid + ":" + Date.now(),
        JSON.stringify({
          empId: user.empId, name: user.name, courseId: cid,
          score: sc, totalQ: c.quiz.length,
          pct: Math.round(sc / c.quiz.length * 100),
          passed: pa, date: new Date().toISOString()
        })
      );
    } catch (e) { /* empty */ }
  }, [user]);

  const onDone = async (cid, sc, pa) => {
    const prev = prog[cid] || {};
    const np = { ...prog, [cid]: { score: Math.max(sc, prev.score || 0), completed: pa || prev.completed, last: new Date().toISOString() } };
    await saveProg(np);
    await saveRes(cid, sc, pa);
  };

  if (!user) return <ELLogin onLogin={u => setUser(u)} />;
  if (!loaded) return <div style={{ textAlign: "center", padding: 60, color: "#666" }}>読み込み中...</div>;

  const done = Object.values(prog).filter(p => p.completed).length;

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
      {/* ユーザー情報バー */}
      <div style={{ background: "linear-gradient(135deg,#1a2d4a,#2E86C1)", borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>受講者</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{user.empId} {user.name}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{done}/{TOTAL_COURSES}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>修了コース</div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
          {Math.round(done / TOTAL_COURSES * 100)}%
        </div>
      </div>

      {/* コース一覧 */}
      {!selC && (
        <div>
          {["法令遵守", "安全", "健康管理", "ミスゼロ", "顧客満足"].map(cat => {
            const cs = COURSES.filter(c => c.cat === cat);
            if (!cs.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 16, background: cs[0].color, borderRadius: 2, display: "inline-block" }} />{cat}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
                  {cs.map(c => {
                    const p = prog[c.id] || {};
                    return (
                      <div key={c.id} onClick={() => setSelC(c.id)}
                        style={{ background: "#fff", borderRadius: 12, padding: "14px", cursor: "pointer", border: p.completed ? `2px solid ${c.color}` : "1px solid #e8e8e8", position: "relative", overflow: "hidden", transition: "all .2s" }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 22 }}>{c.icon}</span>
                          {p.completed && <span style={{ background: c.color, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 10 }}>修了✔</span>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2d4a", margin: "6px 0 4px" }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{c.secs.length}セクション・{c.quiz.length}問</div>
                        {p.score !== undefined && <div style={{ marginTop: 6, fontSize: 11, color: p.completed ? "#27AE60" : "#E74C3C", fontWeight: 600 }}>最高：{p.score}/{c.quiz.length}問</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* コース詳細 */}
      {selC && <CourseView cid={selC} prog={prog} onBack={() => setSelC(null)} onDone={onDone} />}
    </div>
  );
}