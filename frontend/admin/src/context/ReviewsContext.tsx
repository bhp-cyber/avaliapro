import { createContext, useContext, useEffect, useState } from "react";
import type { Review } from "../types/review";
import {
  fetchReviews,
  createReview,
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
  updateReview: (
    reviewId: string,
    data: {
      title?: string;
      comment?: string;
      avatarType?: string;
      avatarPreset?: string;
      avatarUrl?: string;
    }
  ) => Promise<void>;
  deleteReview: (reviewId: string) => void;
  loadReviews: (status?: string) => Promise<void>;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const COMPANY_ID = "15a89577-fa0e-4ad0-9a7f-1d735a20836a";
  const [reviews, setReviews] = useState<Review[]>([]);

  async function loadReviews(status?: string) {
    try {
      const apiReviews = await fetchReviews(COMPANY_ID, status);

      const normalizedReviews: Review[] = apiReviews.map((review: any) => ({
        id: review.id,
        product: review.product?.name ?? "Produto",
        productId: review.productId ?? review.product?.id ?? undefined,
        customer: review.customer?.name ?? review.authorName ?? "Cliente",
        authorName: review.authorName ?? undefined,
        customerAvatar:
          review.avatarType === "preset"
            ? (review.avatarPreset ?? undefined)
            : review.avatarType === "image"
              ? (review.avatarUrl ?? undefined)
              : undefined,
        avatarType: review.avatarType ?? undefined,
        avatarPreset: review.avatarPreset ?? undefined,
        avatarUrl: review.avatarUrl ?? undefined,
        rating: Number(review.rating) || 0,
        title: review.title ?? "",
        comment: review.comment ?? "",
        productVariant: review.productVariant ?? undefined,
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

  async function addReview(review: NewReviewInput) {
    try {
      if (!review.productId) {
        alert("Produto inválido.");
        return;
      }

      await createReview({
        companyId: COMPANY_ID,
        productId: review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        productVariant: review.productVariant,
        authorName: review.customer,
        avatarType: review.avatarType,
        avatarPreset: review.avatarType === "preset" ? review.avatarPreset : undefined,
        avatarUrl:
          review.avatarType === "image" ? review.avatarUrl || review.customerAvatar : undefined,
        verifiedPurchase: false,
      });

      await loadReviews();
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      alert("Erro ao salvar avaliação.");
    }
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

  async function updateReview(
    reviewId: string,
    data: {
      title?: string;
      comment?: string;
      avatarType?: string;
      avatarPreset?: string;
      avatarUrl?: string;
    }
  ) {
    try {
      await updateReviewApi(reviewId, COMPANY_ID, data);

      setReviews((prev) =>
        prev.map((review) => {
          if (review.id !== reviewId) {
            return review;
          }

          const nextAvatarType =
            data.avatarType !== undefined ? data.avatarType : review.avatarType;

          const nextAvatarPreset =
            data.avatarPreset !== undefined ? data.avatarPreset : review.avatarPreset;

          const nextAvatarUrl = data.avatarUrl !== undefined ? data.avatarUrl : review.avatarUrl;

          return {
            ...review,
            title: data.title !== undefined ? data.title : review.title,
            comment: data.comment !== undefined ? data.comment : review.comment,
            avatarType: nextAvatarType,
            avatarPreset: nextAvatarPreset,
            avatarUrl: nextAvatarUrl,
            customerAvatar:
              nextAvatarType === "preset"
                ? nextAvatarPreset
                : nextAvatarType === "image"
                  ? nextAvatarUrl
                  : undefined,
          };
        })
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
