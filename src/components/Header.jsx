export default function Header({ tab, setTab, user, onLogout }) {
  const tabs = [
    { id: "home", label: "ホーム", icon: "🏠" },
    { id: "manual", label: "手順書", icon: "📄" },
    { id: "elearning", label: "Eラーニング", icon: "🎓" },
    { id: "chat", label: "AIチャット", icon: "🤖" },
    { id: "admin", label: "管理者", icon: "🔐" }
  ];

  return (
    <header style={{ background: "linear-gradient(135deg,#0a1628 0%,#1a2d4a 50%,#1B4F72 100%)", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>🚚</div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: 3, textTransform: "uppercase" }}>MEEKS LOGISTICS</div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>統合ポータル</div>
            </div>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>{user.name}</div>
              <button
                onClick={onLogout}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, transition: "all .2s" }}
                onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.08)"}
              >ログアウト</button>
            </div>
          )}
        </div>
        <nav style={{ display: "flex", gap: 2, marginTop: 10, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "rgba(255,255,255,0.15)" : "transparent",
              border: "none", color: "#fff", padding: "10px 18px", cursor: "pointer", fontSize: 12,
              borderRadius: "8px 8px 0 0", opacity: tab === t.id ? 1 : 0.6,
              fontWeight: tab === t.id ? 700 : 400,
              borderBottom: tab === t.id ? "2px solid #3498DB" : "2px solid transparent",
              transition: "all .2s", whiteSpace: "nowrap"
            }}>{t.icon} {t.label}</button>
          ))}
        </nav>
      </div>
    </header>
  );
}