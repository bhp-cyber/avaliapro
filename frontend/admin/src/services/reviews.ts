const API_BASE_URL = "https://avaliapro-api.onrender.com/api";

export async function fetchReviews(companyId: string) {
  const response = await fetch(`${API_BASE_URL}/reviews?companyId=${companyId}&limit=50&offset=0`);

  if (!response.ok) {
    throw new Error("Erro ao buscar avaliações");
  }

  const data = await response.json();

  return data.reviews;
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
