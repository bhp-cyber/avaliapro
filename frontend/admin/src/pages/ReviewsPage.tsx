import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Trash2, Search, Plus, ChevronDown, ChevronUp } from "lucide-react";
import CustomerAvatar from "../components/CustomerAvatar";
import RatingStars from "../components/RatingStars";
import StatusBadge from "../components/StatusBadge";
import { useReviewsContext } from "../context/ReviewsContext";

export default function ReviewsPage() {
  const { reviews, approveReview, deleteReview } = useReviewsContext();

  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const filteredReviews = reviews.filter((review) => {
    const matchesFilter = filter === "Todas" ? true : review.status === filter;

    const term = search.toLowerCase().trim();
    const matchesSearch =
      review.customer.toLowerCase().includes(term) ||
      review.product.toLowerCase().includes(term) ||
      review.title.toLowerCase().includes(term) ||
      review.comment.toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  function toggleExpand(reviewId: string) {
    setExpandedReviewId((prev) => (prev === reviewId ? null : reviewId));
  }

  function handleApprove(reviewId: string) {
    approveReview(reviewId);
  }

  function handleDelete(reviewId: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta avaliação?");

    if (!confirmed) return;

    if (expandedReviewId === reviewId) {
      setExpandedReviewId(null);
    }

    deleteReview(reviewId);
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32 }}>Avaliações</h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>Gerencie todas as avaliações dos produtos.</p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={searchBoxStyle}>
            <Search size={16} color="#6b7280" />
            <input
              type="text"
              placeholder="Buscar por cliente, produto, título ou comentário"
              style={searchInputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select style={filterStyle} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Todas</option>
            <option>Aprovada</option>
            <option>Pendente</option>
          </select>
        </div>

        <Link to="/new-review" style={newReviewButtonStyle}>
          <Plus size={16} />
          Nova avaliação
        </Link>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 1080,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Produto</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Nota</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Origem</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Detalhes</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const isExpanded = expandedReviewId === review.id;
                const isApproved = review.status === "Aprovada";

                return (
                  <Fragment key={review.id}>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={tdStyle}>
                        <div style={productCellStyle}>{review.product}</div>
                      </td>

                      <td style={tdStyle}>
                        <div style={customerCellStyle}>
                          <CustomerAvatar
                            name={review.customer}
                            imageUrl={review.customerAvatar}
                            size={40}
                          />

                          <div style={customerInfoStyle}>
                            <span style={customerNameStyle}>{review.customer}</span>
                          </div>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <RatingStars rating={review.rating} />
                      </td>

                      <td style={tdStyle}>
                        <StatusBadge status={review.status} />
                      </td>

                      <td style={tdStyle}>{review.source}</td>
                      <td style={tdStyle}>{review.date}</td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => toggleExpand(review.id)}
                          style={expandButtonStyle}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {isExpanded ? "Ocultar" : "Ver"}
                        </button>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            style={{
                              ...approveButtonStyle,
                              opacity: isApproved ? 0.6 : 1,
                              cursor: isApproved ? "default" : "pointer",
                            }}
                            onClick={() => handleApprove(review.id)}
                            disabled={isApproved}
                            title={
                              isApproved ? "Esta avaliação já está aprovada" : "Aprovar avaliação"
                            }
                          >
                            <Check size={16} />
                            {isApproved ? "Aprovada" : "Aprovar"}
                          </button>

                          <button
                            type="button"
                            style={deleteButtonStyle}
                            onClick={() => handleDelete(review.id)}
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={8} style={expandedRowCellStyle}>
                          <div style={expandedBoxStyle}>
                            <div style={{ display: "grid", gap: 8 }}>
                              <div style={expandedLineStyle}>
                                <span style={expandedLabelInlineStyle}>Título:</span>
                                <span>{review.title}</span>
                              </div>

                              <div style={expandedLineStyle}>
                                <span style={expandedLabelInlineStyle}>Comentário:</span>
                                <span>{review.comment}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "32px 12px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: 14,
                  }}
                >
                  Nenhuma avaliação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: 14,
  color: "#6b7280",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "16px 12px",
  fontSize: 14,
  color: "#111827",
  verticalAlign: "middle",
};

const productCellStyle: React.CSSProperties = {
  minWidth: 220,
  lineHeight: 1.5,
};

const customerCellStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 220,
};

const customerInfoStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
};

const customerNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
};

const approveButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 600,
};

const deleteButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  background: "#fee2e2",
  color: "#991b1b",
  cursor: "pointer",
  fontWeight: 600,
};

const expandButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "8px 12px",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 600,
};

const expandedRowCellStyle: React.CSSProperties = {
  padding: "0 12px 16px 12px",
  background: "#ffffff",
};

const expandedBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 16,
  borderRadius: 12,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
};

const expandedLineStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  fontSize: 14,
  color: "#374151",
};

const expandedLabelInlineStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "#111827",
};

const searchBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 12px",
  minWidth: 360,
};

const searchInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  fontSize: 14,
  width: "100%",
  color: "#111827",
  background: "transparent",
};

const filterStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 12px",
  background: "#ffffff",
  fontSize: 14,
  color: "#111827",
};

const newReviewButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  background: "#111827",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 600,
};
