import { CONTACTS } from '../data/contacts';

export default function Home({ setTab, user }) {
  const cards = [
    { icon: "📄", title: "手順書を確認する", desc: "納入手順・事故対応・チェックリストを閲覧", tab: "manual", color: "#1B4F72" },
    { icon: "🎓", title: "Eラーニングを受講する", desc: "全11コースの安全教育・確認テスト", tab: "elearning", color: "#1E8449" },
    { icon: "🤖", title: "AIに質問する", desc: "手順書・教育資料の内容をQ&Aで即確認", tab: "chat", color: "#6C3483" },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      {/* タイトル */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🚚</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2d4a", marginBottom: 8 }}>物流事業部 統合ポータル</h1>
        <p style={{ color: "#888", fontSize: 13 }}>
          {user ? `ようこそ、${user.name}さん` : "ようこそ"} — 手順書・Eラーニング・AIチャットを一元管理
        </p>
      </div>

      {/* 機能カード */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.tab} onClick={() => setTab(c.tab)}
            style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", cursor: "pointer", border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all .25s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${c.color},${c.color}88)` }} />
            <div style={{ fontSize: 34, marginBottom: 14 }}>{c.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2d4a", marginBottom: 6 }}>{c.title}</h3>
            <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>{c.desc}</p>
            <div style={{ marginTop: 16, fontSize: 12, color: c.color, fontWeight: 600 }}>開く →</div>
          </div>
        ))}
      </div>

      {/* 緊急連絡先 */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#922B21", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>🚨 緊急連絡先</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, fontSize: 12 }}>
          {CONTACTS.slice(0, 4).map(c => (
            <div key={c.label} style={{ background: "#f8f9fa", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${c.color}` }}>
              <div style={{ color: "#888", fontSize: 11, marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontWeight: 700, color: "#1a2d4a", fontSize: 15 }}>{c.tel}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}