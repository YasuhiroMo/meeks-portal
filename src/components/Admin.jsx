import { useState } from 'react';
import COURSES, { TOTAL_COURSES } from '../data/courses';
import stor, { formatDate } from '../utils/storage';
import { ADMIN_PASSWORD } from '../utils/constants';

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [recs, setRecs] = useState([]);
  const [ld, setLd] = useState(false);
  const [tab, setTab] = useState("summary");
  const [fl, setFl] = useState("");

  const load = async () => {
    setLd(true);
    try {
      const res = await stor.list("res:");
      const keys = res?.keys || [];
      const rs = [];
      for (const k of keys) {
        const r = await stor.get(k);
        if (r?.value) try { rs.push(JSON.parse(r.value)); } catch (e) { /* skip */ }
      }
      rs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecs(rs);
    } catch (e) { setRecs([]); }
    setLd(false);
  };

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuth(true); load(); }
    else setErr("パスワードが違います");
  };

  // ログイン画面
  if (!auth) return (
    <div style={{ maxWidth: 380, margin: "80px auto", background: "#fff", borderRadius: 18, padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a2d4a", marginBottom: 20, textAlign: "center" }}>🔐 管理者ログイン</h2>
      <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(""); }} placeholder="管理者パスワード"
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", marginBottom: 12 }}
        onKeyDown={e => e.key === "Enter" && tryLogin()} />
      {err && <div style={{ color: "#E74C3C", fontSize: 12, marginBottom: 10, textAlign: "center" }}>{err}</div>}
      <button onClick={tryLogin} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#1B4F72", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>ログイン</button>
    </div>
  );

  // 集計
  const em = recs.reduce((a, r) => {
    if (!a[r.empId]) a[r.empId] = { empId: r.empId, name: r.name, courses: {}, att: 0, last: r.date };
    a[r.empId].courses[r.courseId] = { passed: r.passed, score: r.score };
    a[r.empId].att++;
    if (new Date(r.date) > new Date(a[r.empId].last)) a[r.empId].last = r.date;
    return a;
  }, {});
  const el = Object.values(em).filter(e => !fl || (e.empId + e.name).includes(fl));
  const fr = recs.filter(r => !fl || (r.empId + r.name).includes(fl));
  const tp = recs.filter(r => r.passed).length;
  const uq = new Set(recs.map(r => r.empId)).size;
  const fd = Object.values(em).filter(e => Object.values(e.courses).filter(c => c.passed).length === TOTAL_COURSES).length;

  const csv = () => {
    const h = "\uFEFF受験日時,社員番号,氏名,コース,スコア,合否\n";
    const rows = fr.map(r =>
      `${formatDate(r.date)},${r.empId},${r.name},${COURSES.find(c => c.id === r.courseId)?.title || r.courseId},${r.score}/${r.totalQ}(${r.pct}%),${r.passed ? "合格" : "不合格"}`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([h + rows], { type: "text/csv;charset=utf-8" }));
    a.download = `受験結果_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a2d4a" }}>🔐 管理者ダッシュボード</h2>
        <button onClick={load} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #2E86C1", background: "#fff", color: "#2E86C1", cursor: "pointer", fontSize: 12 }}>🔄 最新データ取得</button>
      </div>

      {ld ? <div style={{ textAlign: "center", padding: 40, color: "#666" }}>読み込み中...</div> : (
        <>
          {/* 統計カード */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
            {[["📊", "総受験回数", recs.length], ["👤", "受験者数", uq + "名"], ["✅", "合格数", tp], ["🎓", "全修了者", fd + "名"], ["📈", "合格率", recs.length ? Math.round(tp / recs.length * 100) + "%" : "-%"]].map(([ic, l, v]) => (
              <div key={l} style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #e8e8e8" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{ic}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a2d4a" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* タブ・検索・CSV */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
            {[["summary", "社員別サマリー"], ["detail", "受験履歴"]].map(([id, lb]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: tab === id ? "#1B4F72" : "#e0e0e0", color: tab === id ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: tab === id ? 700 : 400 }}>{lb}</button>
            ))}
            <input value={fl} onChange={e => setFl(e.target.value)} placeholder="社員番号・氏名で検索" style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12, outline: "none", width: 180 }} />
            <button onClick={csv} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #2E86C1", background: "#fff", color: "#2E86C1", cursor: "pointer", fontSize: 12 }}>📥 CSV</button>
          </div>

          {/* テーブル */}
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e0e0e0" }}>
            <div style={{ overflowX: "auto" }}>
              {tab === "summary" ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#1B4F72", color: "#fff" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>社員番号</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>氏名</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>修了数</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>受験回数</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>最終受験日</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>コース別</th>
                  </tr></thead>
                  <tbody>
                    {el.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#999" }}>データなし</td></tr>}
                    {el.map((e, i) => {
                      const pc = Object.values(e.courses).filter(c => c.passed).length;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 ? "#fafafa" : "#fff" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{e.empId}</td>
                          <td style={{ padding: "10px 12px" }}>{e.name}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <span style={{ background: pc === TOTAL_COURSES ? "#27AE60" : pc > 0 ? "#F39C12" : "#ccc", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{pc}/{TOTAL_COURSES}</span>
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{e.att}回</td>
                          <td style={{ padding: "10px 12px", color: "#666" }}>{formatDate(e.last)}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                              {COURSES.map(c => {
                                const st = e.courses[c.id];
                                return <div key={c.id} title={`${c.title}: ${st?.passed ? "合格" : st ? "不合格" : "未受験"}`}
                                  style={{ width: 14, height: 14, borderRadius: 3, background: st?.passed ? "#27AE60" : st ? "#E74C3C" : "#ddd", fontSize: 7, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {st?.passed ? "✓" : st ? "×" : ""}
                                </div>;
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#1B4F72", color: "#fff" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>受験日時</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>社員番号</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>氏名</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>コース</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>スコア</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>合否</th>
                  </tr></thead>
                  <tbody>
                    {fr.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#999" }}>データなし</td></tr>}
                    {fr.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 ? "#fafafa" : "#fff" }}>
                        <td style={{ padding: "10px 12px", color: "#666", whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.empId}</td>
                        <td style={{ padding: "10px 12px" }}>{r.name}</td>
                        <td style={{ padding: "10px 12px" }}>{COURSES.find(c => c.id === r.courseId)?.icon} {COURSES.find(c => c.id === r.courseId)?.title || r.courseId}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600 }}>{r.score}/{r.totalQ}（{r.pct}%）</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ background: r.passed ? "#27AE60" : "#E74C3C", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{r.passed ? "合格" : "不合格"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}