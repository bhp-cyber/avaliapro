export type ReviewStatus = "Aprovada" | "Pendente" | "approved" | "pending" | "rejected";

export type ReviewSource = "Manual" | "Cliente";

export type Review = {
  id: string;
  product: string;
  customer: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  source: ReviewSource;
  date: string;
};
