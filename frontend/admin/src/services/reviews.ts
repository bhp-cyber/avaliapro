const API_BASE_URL = "http://localhost:4000/api";

export async function fetchReviews(companyId: string, status?: string) {
  const query = new URLSearchParams({
    companyId,
    limit: "50",
    offset: "0",
  });

  if (status && status !== "Todas") {
    query.set(
      "status",
      status === "Pendente"
        ? "pending"
        : status === "Aprovada"
          ? "approved"
          : status === "Rejeitada"
            ? "rejected"
            : status
    );
  }

  const response = await fetch(`${API_BASE_URL}/reviews?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar avaliações");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.reviews) ? data.reviews : [];
}

export async function approveReview(reviewId: string, companyId: string) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "approved",
      companyId,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao aprovar avaliação");
  }

  return response.json();
}

export async function rejectReview(reviewId: string, companyId: string) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "rejected",
      companyId,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao rejeitar avaliação");
  }

  return response.json();
}

export async function updateReview(
  reviewId: string,
  companyId: string,
  data: { title: string; comment: string }
) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyId,
      title: data.title,
      comment: data.comment,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar avaliação");
  }

  return response.json();
}
