import { API_BASE_URL } from "./api";
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

export async function deleteReview(reviewId: string, companyId: string) {
  const query = new URLSearchParams({
    companyId,
  });

  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}?${query.toString()}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir avaliação");
  }

  return response.json();
}

export async function updateReview(
  reviewId: string,
  companyId: string,
  data: {
    title?: string;
    comment?: string;
    avatarType?: string;
    avatarPreset?: string;
    avatarUrl?: string;
  }
) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyId,
      title: data.title?.trim() || undefined,
      comment: data.comment?.trim() || undefined,
      avatarType: data.avatarType || undefined,
      avatarPreset: data.avatarPreset || undefined,
      avatarUrl: data.avatarUrl || undefined,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar avaliação");
  }

  return response.json();
}

export async function createReview(data: {
  companyId: string;
  productId: string;
  sku?: string;
  rating: number;
  title?: string;
  comment: string;
  authorName?: string;
  avatarType?: string;
  avatarPreset?: string;
  avatarUrl?: string;
  verifiedPurchase?: boolean;
  productVariant?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyId: data.companyId,
      productId: data.productId,
      sku: data.sku?.trim() || undefined,
      rating: data.rating,
      title: data.title?.trim() || undefined,
      comment: data.comment,
      authorName: data.authorName?.trim() || undefined,
      productVariant: data.productVariant?.trim() || undefined,
      avatarType: data.avatarType || undefined,
      avatarPreset: data.avatarPreset || undefined,
      avatarUrl: data.avatarUrl || undefined,
      verifiedPurchase: data.verifiedPurchase ?? false,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar avaliação");
  }

  return response.json();
}
