"use client";

import { useRef, useEffect } from "react";
import type { CalloutBlockData } from "../types";

type Props = {
  data: CalloutBlockData;
  onChange?: (data: CalloutBlockData) => void;
  readOnly?: boolean;
};

const VARIANT_STYLES = {
  info: { borderColor: "#3b82f6", bg: "#eff6ff" },
  warning: { borderColor: "#f59e0b", bg: "#fffbeb" },
  danger: { borderColor: "#ef4444", bg: "#fef2f2" },
  success: { borderColor: "#22c55e", bg: "#f0fdf4" },
};

export default function CalloutBlock({ data, onChange, readOnly }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const vs = VARIANT_STYLES[data.variant];

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== data.html) {
      ref.current.innerHTML = data.html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "8px",
    borderLeft: `4px solid ${vs.borderColor}`,
    backgroundColor: vs.bg,
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    outline: "none",
    fontSize: "14px",
    lineHeight: 1.6,
    minHeight: "1.5em",
    wordBreak: "break-word",
  };

  if (readOnly) {
    return (
      <div style={containerStyle}>
        <span style={{ fontSize: "18px", flexShrink: 0 }}>{data.icon}</span>
        <div
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: data.html || "&nbsp;" }}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <span
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange?.({ ...data, icon: (e.currentTarget as HTMLElement).textContent ?? data.icon })}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ fontSize: "18px", flexShrink: 0, outline: "none", minWidth: "24px" }}
      >
        {data.icon}
      </span>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        style={textStyle}
        onInput={() => {
          if (!ref.current || !onChange) return;
          onChange({ ...data, html: ref.current.innerHTML });
        }}
        data-placeholder="Add callout text..."
      />
    </div>
  );
}
