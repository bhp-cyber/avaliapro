import type { ReviewStatus } from "../types/review";

type Props = {
  status: ReviewStatus;
};

export default function StatusBadge({ status }: Props) {
  const isApproved = status === "Aprovada";

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: isApproved ? "#dcfce7" : "#fef3c7",
        color: isApproved ? "#166534" : "#92400e",
      }}
    >
      {status}
    </span>
  );
}
