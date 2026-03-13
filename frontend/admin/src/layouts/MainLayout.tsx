import { Link } from "react-router-dom";

type MainLayoutProps = {
    children: React.ReactNode;
  };
  
  export default function MainLayout({ children }: MainLayoutProps) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          minHeight: "100vh",
          background: "#f5f7fb",
          color: "#1f2937",
        }}
      >
        <aside
          style={{
            background: "#111827",
            color: "#ffffff",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Reviews App</h2>
            <p style={{ margin: "8px 0 0", opacity: 0.7, fontSize: 14 }}>
              Painel do lojista
            </p>
          </div>
  
          <nav style={{ display: "grid", gap: 12 }}>
            <Link to="/" style={menuItemStyle}>Dashboard</Link>

            <Link to="/reviews" style={menuItemStyle}>
              Avaliações
           </Link>

            <Link to="/new-review" style={menuItemStyle}>
              Nova avaliação
           </Link>

            <Link to="/products" style={menuItemStyle}>
              Produtos
           </Link>

            <Link to="/settings" style={menuItemStyle}>
              Configurações
           </Link>
         </nav>
        </aside>
  
        <main style={{ padding: 32 }}>
          {children}
        </main>
      </div>
    );
  }
  
  const menuItemStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
  };