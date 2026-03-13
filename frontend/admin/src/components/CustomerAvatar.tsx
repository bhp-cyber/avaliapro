import { useMemo, useState } from "react";
import { User } from "lucide-react";

type Props = {
  name: string;
  imageUrl?: string;
  size?: number;
};

export default function CustomerAvatar({ name, imageUrl, size = 40 }: Props) {
  const [imageError, setImageError] = useState(false);

  const initials = useMemo(() => {
    const parts = name.trim().split(" ").filter(Boolean).slice(0, 2);

    if (parts.length === 0) return "CL";

    return parts.map((p) => p[0]?.toUpperCase()).join("");
  }, [name]);

  const background = useMemo(() => {
    return getAvatarColor(name || imageUrl || "cliente");
  }, [name, imageUrl]);

  const showImage = Boolean(imageUrl?.trim()) && !imageError;

  if (showImage) {
    return (
      <img
        src={imageUrl}
        alt={`Foto de perfil de ${name}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: "999px",
          objectFit: "cover",
          background: "#e5e7eb",
          display: "block",
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "999px",
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: size >= 40 ? 14 : 12,
        letterSpacing: 0.3,
        boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
      }}
    >
      {name.trim() ? initials : <User size={18} color="#ffffff" />}
    </div>
  );
}

function getAvatarColor(value: string) {
  const palette = [
    "#111827",
    "#1f2937",
    "#374151",
    "#4b5563",
    "#7c3aed",
    "#2563eb",
    "#0f766e",
    "#be185d",
    "#b45309",
    "#059669",
  ];

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
}
