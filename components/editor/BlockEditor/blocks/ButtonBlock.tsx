"use client";

import type { ButtonBlockData } from "../types";

type Props = {
  data: ButtonBlockData;
  onChange?: (data: ButtonBlockData) => void;
  readOnly?: boolean;
};

export default function ButtonBlock({ data, onChange, readOnly }: Props) {
  const SIZE_PAD = { sm: "4px 12px", md: "8px 20px", lg: "12px 28px" };
  const SIZE_FONT = { sm: "12px", md: "14px", lg: "16px" };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: SIZE_PAD[data.size],
    fontSize: SIZE_FONT[data.size],
    borderRadius: `${data.borderRadius}px`,
    fontWeight: 600,
    textDecoration: "none",
    cursor: readOnly ? "pointer" : "default",
    outline: "none",
    border: "none",
  };

  let variantStyle: React.CSSProperties = {};
  switch (data.variant) {
    case "filled":
      variantStyle = { backgroundColor: data.color || "#C9B59C", color: "#fff" };
      break;
    case "outlined":
      variantStyle = { border: `2px solid ${data.color || "#C9B59C"}`, color: data.color || "#C9B59C", backgroundColor: "transparent" };
      break;
    case "ghost":
      variantStyle = { color: data.color || "#C9B59C", backgroundColor: "transparent" };
      break;
  }

  const combinedStyle = { ...baseStyle, ...variantStyle };

  if (readOnly) {
    return (
      <a href={data.href || "#"} target={data.href ? "_blank" : undefined} rel="noopener noreferrer" style={combinedStyle}>
        {data.label || "Button"}
      </a>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange?.({ ...data, label: (e.currentTarget as HTMLElement).textContent ?? data.label })}
        onPointerDown={(e) => e.stopPropagation()}
        style={combinedStyle}
      >
        {data.label}
      </span>
      <input
        type="text"
        value={data.href}
        onChange={(e) => onChange?.({ ...data, href: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="URL"
        style={{
          fontSize: "11px",
          padding: "3px 8px",
          border: "1px solid #D9CFC7",
          borderRadius: "4px",
          outline: "none",
          backgroundColor: "#F9F8F6",
          color: "#888",
          width: "140px",
        }}
      />
    </div>
  );
}
