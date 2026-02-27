"use client";

import type { BadgeBlockData } from "../types";

type Props = {
  data: BadgeBlockData;
  onChange?: (data: BadgeBlockData) => void;
  readOnly?: boolean;
};

export default function BadgeBlock({ data, onChange, readOnly }: Props) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: `${data.borderRadius}px`,
    backgroundColor: data.bgColor || "#EFE9E3",
    color: data.textColor || "#1a1a1a",
    fontSize: "12px",
    fontWeight: 500,
  };

  if (readOnly) {
    return <span style={style}>{data.label || "Badge"}</span>;
  }

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange?.({ ...data, label: (e.currentTarget as HTMLElement).textContent ?? data.label })}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ ...style, outline: "none", minWidth: "40px" }}
    >
      {data.label}
    </span>
  );
}
