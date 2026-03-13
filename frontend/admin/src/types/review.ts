export type ReviewStatus = "Aprovada" | "Pendente";

export type ReviewSource = "Manual" | "Cliente";

export type Review = {
  id: number;
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
