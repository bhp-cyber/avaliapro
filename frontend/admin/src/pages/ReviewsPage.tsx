import { Fragment, useState, useEffect } from "react";
import NewReviewPage from "./NewReviewPage";
import {
  Check,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X,
  Trash2,
  Pencil,
  Save,
} from "lucide-react";
import CustomerAvatar from "../components/CustomerAvatar";
import RatingStars from "../components/RatingStars";
import StatusBadge from "../components/StatusBadge";
import { useReviewsContext } from "../context/ReviewsContext";

export default function ReviewsPage() {
  const { reviews, approveReview, rejectReview, updateReview, deleteReview, loadReviews } =
    useReviewsContext();

  const [filter, setFilter] = useState("Todas");
  useEffect(() => {
    setOpenMenuReviewId(null);
    loadReviews(filter);
  }, [filter]);

  const [search, setSearch] = useState("");
  useEffect(() => {
    setOpenMenuReviewId(null);
  }, [search]);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [openMenuReviewId, setOpenMenuReviewId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!openMenuReviewId) return;

      const target = event.target as Node;
      const menuElement = document.querySelector(`[data-review-menu-id="${openMenuReviewId}"]`);

      if (!menuElement) {
        setOpenMenuReviewId(null);
        return;
      }

      if (!menuElement.contains(target)) {
        setOpenMenuReviewId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuReviewId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuReviewId]);

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
    setOpenMenuReviewId(null);
    setExpandedReviewId((prev) => (prev === reviewId ? null : reviewId));
  }

  function toggleMenu(reviewId: string) {
    setOpenMenuReviewId((prev) => (prev === reviewId ? null : reviewId));
  }

  async function handleApprove(reviewId: string) {
    await approveReview(reviewId);
    setOpenMenuReviewId(null);
  }

  async function handleReject(reviewId: string) {
    await rejectReview(reviewId);
    setOpenMenuReviewId(null);
  }

  function handleEdit(reviewId: string) {
    const reviewToEdit = reviews.find((review) => review.id === reviewId);

    if (!reviewToEdit) return;

    setEditingReviewId(reviewId);
    setEditingTitle(reviewToEdit.title);
    setEditingComment(reviewToEdit.comment);
    setOpenMenuReviewId(null);
  }

  function handleCloseEditModal() {
    setEditingReviewId(null);
    setEditingTitle("");
    setEditingComment("");
  }

  async function handleSaveEdit() {
    if (!editingReviewId) return;

    const title = editingTitle.trim();
    const comment = editingComment.trim();

    await updateReview(editingReviewId, {
      title,
      comment,
    });

    handleCloseEditModal();
  }

  function handleDelete(reviewId: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta avaliação?");

    if (!confirmed) return;

    if (expandedReviewId === reviewId) {
      setExpandedReviewId(null);
    }

    deleteReview(reviewId);
    setOpenMenuReviewId(null);
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
            <option>Rejeitada</option>
          </select>
        </div>

        <button
          type="button"
          style={newReviewButtonStyle}
          onClick={() => setIsNewReviewModalOpen(true)}
        >
          <Plus size={16} />
          Nova avaliação
        </button>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          overflowX: "auto",
          overflowY: "visible",
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
                const isMenuOpen = openMenuReviewId === review.id;
                const rowStyle = isMenuOpen ? activeTableRowStyle : tableRowStyle;

                return (
                  <Fragment key={review.id}>
                    <tr style={rowStyle}>
                      <td style={tdStyle}>
                        <div style={productCellStyle}>{review.product}</div>
                      </td>

                      <td style={tdStyle}>
                        <div style={customerCellStyle}>
                          <CustomerAvatar
                            name={review.authorName || review.customer || "Cliente"}
                            imageUrl={
                              review.avatarType === "preset"
                                ? review.avatarPreset
                                : review.avatarType === "image"
                                  ? review.avatarUrl
                                  : undefined
                            }
                            size={40}
                          />

                          <div style={customerInfoStyle}>
                            <span style={customerNameStyle}>
                              {review.authorName || review.customer || "Cliente"}
                            </span>
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
                        <div data-review-menu-id={review.id} style={{ position: "relative" }}>
                          <button
                            type="button"
                            style={isMenuOpen ? activeMenuButtonStyle : menuButtonStyle}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              toggleMenu(review.id);
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuReviewId === review.id && (
                            <div style={actionsMenuStyle}>
                              <div style={menuActionsGroupStyle}>
                                <button
                                  type="button"
                                  style={menuActionButtonStyle}
                                  onClick={() => handleEdit(review.id)}
                                >
                                  <Pencil size={18} />
                                  Editar avaliação
                                </button>

                                {!isApproved && (
                                  <button
                                    type="button"
                                    style={approveButtonStyle}
                                    onClick={() => handleApprove(review.id)}
                                  >
                                    <Check size={18} />
                                    Aprovar avaliação
                                  </button>
                                )}

                                {review.status !== "Rejeitada" && (
                                  <button
                                    type="button"
                                    style={rejectButtonStyle}
                                    onClick={() => handleReject(review.id)}
                                  >
                                    <X size={18} />
                                    Rejeitar avaliação
                                  </button>
                                )}
                              </div>

                              <div style={menuDividerStyle} />

                              <button
                                type="button"
                                style={deleteButtonStyle}
                                onClick={() => handleDelete(review.id)}
                              >
                                <Trash2 size={18} />
                                Excluir avaliação
                              </button>
                            </div>
                          )}
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

      {isNewReviewModalOpen && (
        <div style={editModalOverlayStyle}>
          <div
            style={{
              ...editModalStyle,
              maxWidth: 920,
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
            }}
          >
            <div style={editModalHeaderStyle}>
              <h2 style={editModalTitleStyle}>Nova avaliação</h2>

              <button
                type="button"
                style={editModalCloseButtonStyle}
                onClick={() => setIsNewReviewModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <NewReviewPage
                onClose={() => {
                  setIsNewReviewModalOpen(false);
                  loadReviews(filter);
                }}
                hidePageHeader
              />
            </div>
          </div>
        </div>
      )}

      {editingReviewId && (
        <div style={editModalOverlayStyle}>
          <div style={editModalStyle}>
            <div style={editModalHeaderStyle}>
              <h2 style={editModalTitleStyle}>Editar avaliação</h2>

              <button
                type="button"
                style={editModalCloseButtonStyle}
                onClick={handleCloseEditModal}
              >
                <X size={18} />
              </button>
            </div>

            <div style={editModalBodyStyle}>
              <div style={editFieldStyle}>
                <label style={editLabelStyle}>Título</label>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  style={editInputStyle}
                />
              </div>

              <div style={editFieldStyle}>
                <label style={editLabelStyle}>Comentário</label>
                <textarea
                  value={editingComment}
                  onChange={(event) => setEditingComment(event.target.value)}
                  style={editTextareaStyle}
                  rows={6}
                />
              </div>
            </div>

            <div style={editModalFooterStyle}>
              <button type="button" style={editSecondaryButtonStyle} onClick={handleCloseEditModal}>
                Cancelar
              </button>

              <button type="button" style={editPrimaryButtonStyle} onClick={handleSaveEdit}>
                <Save size={16} />
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tableRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
};

const activeTableRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
  background: "#fafafa",
};

const editModalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 100,
};

const editModalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 640,
  background: "#ffffff",
  borderRadius: 20,
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.18)",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
};

const editModalHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 24px",
  borderBottom: "1px solid #e5e7eb",
};

const editModalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  color: "#111827",
};

const editModalCloseButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 6,
  borderRadius: 10,
  color: "#6b7280",
};

const editModalBodyStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
  padding: 24,
};

const editFieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const editLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
};

const editInputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
};

const editTextareaStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111827",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const editModalFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "20px 24px",
  borderTop: "1px solid #e5e7eb",
};

const editSecondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const editPrimaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

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

function getMenuStatusBadgeStyle(status: string): React.CSSProperties {
  if (status === "Aprovada") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#dcfce7",
      color: "#166534",
      fontSize: 12,
      fontWeight: 700,
    };
  }

  if (status === "Rejeitada") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#fee2e2",
      color: "#991b1b",
      fontSize: 12,
      fontWeight: 700,
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 700,
  };
}

const menuHeaderStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: "4px 4px 10px 4px",
};

const menuTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#111827",
  letterSpacing: "-0.01em",
};

const menuMetaBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
};

const menuProductNameStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#111827",
  lineHeight: 1.4,
};

const menuCustomerNameStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  lineHeight: 1.4,
};

const menuBadgesRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const menuSourceBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 700,
};

const menuActionsGroupStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const menuDividerStyle: React.CSSProperties = {
  height: 1,
  background: "#e5e7eb",
  margin: "4px 0",
};

const menuActionButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  color: "#111827",
};

const approveButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  color: "#111827",
};

const rejectButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  color: "#111827",
};

const menuButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 6,
  borderRadius: 10,
};

const activeMenuButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  background: "#f3f4f6",
  cursor: "pointer",
  padding: 6,
  borderRadius: 10,
};

const actionsMenuStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 36,
  minWidth: 220,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
  padding: 6,
  display: "grid",
  gap: 4,
  zIndex: 20,
};

const deleteButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  color: "#dc2626",
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
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
};
