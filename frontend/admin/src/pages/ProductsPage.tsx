import { useEffect, useState } from "react";
import { createProduct, fetchProducts } from "../services/products";

type Product = {
  id: string;
  name: string;
  sku: string;
};

const COMPANY_ID = "48b20d58-8847-417a-940f-a9793bf40807";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");

  async function loadProducts() {
    try {
      const data = await fetchProducts(COMPANY_ID);
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedSku = sku.trim();

    if (!normalizedName) {
      alert("Informe o nome do produto.");
      return;
    }

    try {
      await createProduct({
        name: normalizedName,
        sku: normalizedSku || undefined,
        companyId: COMPANY_ID,
      });

      setName("");
      setSku("");
      await loadProducts();
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert("Não foi possível cadastrar o produto.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32 }}>Produtos</h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>
          Produtos cadastrados no AvaliaPro para esta empresa.
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <form
          onSubmit={handleCreateProduct}
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "2fr 1fr auto",
            alignItems: "end",
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
              Nome do produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Wig Denise Fibra Premium Ondulada 60cm"
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="Ex: LC259-8"
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              background: "#111827",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
              height: 46,
            }}
          >
            Cadastrar produto
          </button>
        </form>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        {isLoading ? (
          <p style={{ margin: 0, color: "#6b7280" }}>Carregando produtos...</p>
        ) : products.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 8px", color: "#6b7280", fontSize: 14 }}>Nome</th>
                <th style={{ padding: "12px 8px", color: "#6b7280", fontSize: 14 }}>SKU</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 8px", fontSize: 14, color: "#111827" }}>
                    {product.name}
                  </td>
                  <td style={{ padding: "14px 8px", fontSize: 14, color: "#111827" }}>
                    {product.sku || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ margin: 0, color: "#6b7280" }}>Nenhum produto cadastrado no AvaliaPro.</p>
        )}
      </div>
    </div>
  );
}
