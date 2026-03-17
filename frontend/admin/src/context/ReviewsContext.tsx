import { createContext, useContext, useEffect, useState } from "react";
import type { Review } from "../types/review";
import {
  fetchReviews,
  approveReview as approveReviewApi,
  rejectReview as rejectReviewApi,
  updateReview as updateReviewApi,
  deleteReview as deleteReviewApi,
} from "../services/reviews";

type NewReviewInput = Omit<Review, "id" | "date">;

type ReviewsContextType = {
  reviews: Review[];
  addReview: (review: NewReviewInput) => void;
  approveReview: (reviewId: string) => Promise<void>;
  rejectReview: (reviewId: string) => Promise<void>;
  updateReview: (reviewId: string, data: { title: string; comment: string }) => Promise<void>;
  deleteReview: (reviewId: string) => void;
  loadReviews: (status?: string) => Promise<void>;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const COMPANY_ID = "48b20d58-8847-417a-940f-a9793bf40807";
  const [reviews, setReviews] = useState<Review[]>([]);

  async function loadReviews(status?: string) {
    try {
      const apiReviews = await fetchReviews(COMPANY_ID, status);

      const normalizedReviews: Review[] = apiReviews.map((review: any) => ({
        id: review.id,
        product: review.product?.name ?? "Produto",
        customer: review.customer?.name ?? review.authorName ?? "Cliente",
        customerAvatar: undefined,
        rating: Number(review.rating) || 0,
        title: review.title ?? "",
        comment: review.comment ?? "",
        status:
          review.status === "approved"
            ? "Aprovada"
            : review.status === "pending"
              ? "Pendente"
              : review.status === "rejected"
                ? "Rejeitada"
                : "Pendente",
        source: review.verifiedPurchase ? "Cliente" : "Manual",
        date: new Date(review.createdAt).toLocaleDateString("pt-BR"),
      }));

      setReviews(normalizedReviews);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  function addReview(review: NewReviewInput) {
    const newReview: Review = {
      ...review,
      customer: review.customer.trim(),
      customerAvatar: review.customerAvatar?.trim() || undefined,
      title: review.title?.trim() || "",
      comment: review.comment.trim(),
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString("pt-BR"),
    };

    setReviews((prev) => [newReview, ...prev]);
  }

  async function approveReview(reviewId: string) {
    try {
      await approveReviewApi(reviewId, COMPANY_ID);

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                status: "Aprovada",
              }
            : review
        )
      );
    } catch (error) {
      console.error("Erro ao aprovar avaliação:", error);
    }
  }

  async function rejectReview(reviewId: string) {
    try {
      await rejectReviewApi(reviewId, COMPANY_ID);

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                status: "Rejeitada",
              }
            : review
        )
      );
    } catch (error) {
      console.error("Erro ao rejeitar avaliação:", error);
    }
  }

  async function updateReview(reviewId: string, data: { title: string; comment: string }) {
    try {
      await updateReviewApi(reviewId, COMPANY_ID, data);

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                title: data.title,
                comment: data.comment,
              }
            : review
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar avaliação:", error);
    }
  }

  async function deleteReview(reviewId: string) {
    try {
      await deleteReviewApi(reviewId, COMPANY_ID);

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
    }
  }

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        approveReview,
        rejectReview,
        updateReview,
        deleteReview,
        loadReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviewsContext() {
  const context = useContext(ReviewsContext);

  if (!context) {
    throw new Error("useReviewsContext must be used within ReviewsProvider");
  }

  return context;
}
