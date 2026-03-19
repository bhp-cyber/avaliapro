export type ReviewStatus =
  | "Aprovada"
  | "Pendente"
  | "Rejeitada"
  | "approved"
  | "pending"
  | "rejected";

export type ReviewSource = "Manual" | "Cliente";

export type Review = {
  id: string;
  product: string;
  productId?: string;
  customer: string;
  authorName?: string;
  customerAvatar?: string;
  avatarType?: string;
  avatarPreset?: string;
  avatarUrl?: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  source: ReviewSource;
  date: string;
};
