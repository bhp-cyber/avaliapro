import { useEffect, useMemo, useState } from "react";
import { Image, Search, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReviewsContext } from "../context/ReviewsContext";
import { fetchProducts } from "../services/products";

type Product = {
  id: string;
  name: string;
  sku: string;
  platform?: string | null;
  platformProductId?: string | null;
  platformVariantId?: string | null;
};

export default function NewReviewPage() {
  const navigate = useNavigate();
  const { addReview } = useReviewsContext();

  const COMPANY_ID = "15a89577-fa0e-4ad0-9a7f-1d735a20836a";

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts(COMPANY_ID, productSearch);
        setProducts(data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    }

    loadProducts();
  }, [productSearch]);

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [avatarPreset, setAvatarPreset] = useState<string | null>(null);

  const [customerAvatar, setCustomerAvatar] = useState("");
  const [avatarPreviewError, setAvatarPreviewError] = useState(false);

  useEffect(() => {
    if (avatarPreset) {
      setCustomerAvatar(avatarPreset);
    }
  }, [avatarPreset]);

  const [comment, setComment] = useState("");

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();

    const realProducts = products.filter((product) => {
      return product.platform === "nuvemshop";
    });

    const baseProducts = realProducts.filter(
      (product, index, array) =>
        index ===
        array.findIndex(
          (item) =>
            item.id === product.id || (item.sku === product.sku && item.name === product.name)
        )
    );

    if (!term) return baseProducts;

    return baseProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
    );
  }, [productSearch, products]);

  useEffect(() => {
    setAvatarPreviewError(false);
  }, [customerAvatar]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedProduct) {
      alert("Selecione um produto.");
      return;
    }

    if (!customerName.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    if (!comment.trim()) {
      alert("Informe o comentário da avaliação.");
      return;
    }

    addReview({
      product: selectedProduct.name,
      productId: selectedProduct.id,
      customer: customerName.trim(),
      customerAvatar: customerAvatar.trim() || undefined,
      avatarType: customerAvatar.trim() ? "image" : undefined,
      avatarUrl: customerAvatar.trim() || undefined,
      avatarPreset: undefined,
      rating,
      title: "",
      comment: comment.trim(),
      status: "Aprovada",
      source: "Manual",
    });

    navigate("/reviews");
  }

  const showImagePreview = customerAvatar.trim() !== "" && !avatarPreviewError;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32 }}>Nova Avaliação</h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>Crie uma avaliação manual para um produto.</p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          maxWidth: 820,
        }}
      >
        <form style={{ display: "grid", gap: 20 }} onSubmit={handleSubmit}>
          <div style={fieldGridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Produto</label>

              <div style={{ position: "relative" }}>
                <div style={searchInputWrapperStyle}>
                  <Search size={18} color="#6b7280" />
                  <input
                    type="text"
                    placeholder="Buscar produto por nome ou SKU"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setSelectedProduct(null);
                    }}
                    style={searchInputStyle}
                  />
                </div>

                {productSearch.trim() !== "" && !selectedProduct && (
                  <div style={productDropdownStyle}>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductSearch(product.name);
                          }}
                          style={productOptionStyle}
                        >
                          <div style={{ fontWeight: 600, color: "#111827" }}>{product.name}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>SKU: {product.sku}</div>
                        </button>
                      ))
                    ) : (
                      <div style={emptyResultStyle}>Nenhum produto encontrado.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Nome do cliente</label>
              <input
                type="text"
                placeholder="Ex: Maria Silva"
                style={inputStyle}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Avatar do cliente — opcional</label>

            <div style={avatarFieldWrapperStyle}>
              <div style={avatarPreviewContainerStyle}>
                {showImagePreview ? (
                  <img
                    src={customerAvatar}
                    alt={`Foto de perfil de ${customerName || "cliente"}`}
                    style={avatarImageStyle}
                    onError={() => setAvatarPreviewError(true)}
                  />
                ) : (
                  <div
                    style={{
                      ...avatarFallbackStyle,
                      background: "#7c3aed",
                    }}
                  >
                    <User size={24} color="#ffffff" />
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gap: 12, flex: 1 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    "https://i.pravatar.cc/100?img=1",
                    "https://i.pravatar.cc/100?img=2",
                    "https://i.pravatar.cc/100?img=3",
                    "https://i.pravatar.cc/100?img=4",
                    "https://i.pravatar.cc/100?img=5",
                  ].map((url) => {
                    const isSelected = customerAvatar === url;

                    return (
                      <img
                        key={url}
                        src={url}
                        alt="Avatar"
                        onClick={() => {
                          setAvatarPreset(url);
                          setAvatarPreviewError(false);
                        }}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 999,
                          objectFit: "cover",
                          cursor: "pointer",
                          border: isSelected ? "2px solid #111827" : "2px solid transparent",
                          transform: isSelected ? "scale(1.06)" : "scale(1)",
                          transition: "all 0.2s ease",
                        }}
                      />
                    );
                  })}
                </div>

                {customerAvatar.trim() !== "" && avatarPreviewError && (
                  <span style={errorTextStyle}>
                    Não foi possível carregar esta imagem. O avatar automático será usado como
                    fallback.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nota</label>

            <div style={ratingBoxStyle}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  style={starButtonStyle}
                >
                  <Star
                    size={22}
                    fill={(hover ?? rating) >= star ? "#fbbf24" : "none"}
                    color="#fbbf24"
                  />
                </button>
              ))}

              <span style={{ color: "#6b7280", fontSize: 14, marginLeft: 6 }}>{rating} de 5</span>
            </div>

            <span style={helperTextStyle}>
              Avaliações criadas manualmente são aprovadas automaticamente.
            </span>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Comentário</label>
            <textarea
              placeholder="Escreva a avaliação do cliente"
              style={textareaStyle}
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button type="button" style={secondaryButtonStyle} onClick={() => navigate("/reviews")}>
              Cancelar
            </button>

            <button type="submit" style={primaryButtonStyle}>
              Salvar avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111827",
  outline: "none",
  background: "#ffffff",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111827",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
};

const ratingBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 46,
};

const starButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const helperTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
};

const errorTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#b91c1c",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#111827",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 600,
  cursor: "pointer",
};

const searchInputWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "12px 14px",
  background: "#ffffff",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: 14,
  color: "#111827",
  background: "transparent",
};

const productDropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  maxHeight: 220,
  overflowY: "auto",
  zIndex: 20,
};

const productOptionStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "#ffffff",
  textAlign: "left",
  padding: "12px 14px",
  cursor: "pointer",
  display: "grid",
  gap: 4,
};

const emptyResultStyle: React.CSSProperties = {
  padding: "14px",
  color: "#6b7280",
  fontSize: 14,
};

const avatarFieldWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
  padding: 16,
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "#f9fafb",
};

const avatarPreviewContainerStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  minWidth: 72,
  borderRadius: "999px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  background: "#e5e7eb",
};

const avatarImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const avatarFallbackStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const urlInputWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "12px 14px",
  background: "#ffffff",
};

const urlInputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: 14,
  color: "#111827",
  background: "transparent",
};
