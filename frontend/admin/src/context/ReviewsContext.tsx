import { createContext, useContext, useState } from "react";
import { mockReviews } from "../data/mockReviews";
import type { Review } from "../types/review";

type NewReviewInput = Omit<Review, "id" | "date">;

type ReviewsContextType = {
  reviews: Review[];
  addReview: (review: NewReviewInput) => void;
  approveReview: (reviewId: number) => void;
  deleteReview: (reviewId: number) => void;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  function addReview(review: NewReviewInput) {
    const newReview: Review = {
      ...review,
      customer: review.customer.trim(),
      customerAvatar: review.customerAvatar?.trim() || undefined,
      title: review.title.trim(),
      comment: review.comment.trim(),
      id: Date.now(),
      date: new Date().toLocaleDateString("pt-BR"),
    };

    setReviews((prev) => [newReview, ...prev]);
  }

  function approveReview(reviewId: number) {
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
  }

  function deleteReview(reviewId: number) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  }

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        approveReview,
        deleteReview,
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
