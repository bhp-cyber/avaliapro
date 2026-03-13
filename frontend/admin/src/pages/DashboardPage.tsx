export default function DashboardPage() {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Dashboard</h1>
          <p style={{ marginTop: 8, color: "#6b7280" }}>
            Visão geral do app de avaliações
          </p>
        </div>
  
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          <Card title="Total de avaliações" value="128" />
          <Card title="Pendentes" value="12" />
          <Card title="Aprovadas" value="110" />
          <Card title="Média geral" value="4.8" />
        </div>
      </div>
    );
  }
  
  type CardProps = {
    title: string;
    value: string;
  };
  
  function Card({ title, value }: CardProps) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>{title}</p>
        <h2 style={{ margin: "12px 0 0", fontSize: 28, color: "#111827" }}>
          {value}
        </h2>
      </div>
    );
  }