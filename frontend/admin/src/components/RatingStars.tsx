import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  size?: number;
};

export default function RatingStars({ rating, size = 16 }: RatingStarsProps) {
  return (
    <div style={containerStyle} aria-label={`Avaliação de ${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} fill={star <= rating ? "#fbbf24" : "none"} color="#fbbf24" />
      ))}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: 2,
  alignItems: "center",
};
