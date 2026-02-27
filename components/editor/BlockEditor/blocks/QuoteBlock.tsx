"use client";

import { useRef, useEffect } from "react";
import type { QuoteBlockData } from "../types";

type Props = {
  data: QuoteBlockData;
  onChange?: (data: QuoteBlockData) => void;
  readOnly?: boolean;
};

export default function QuoteBlock({ data, onChange, readOnly }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== data.html) {
      ref.current.innerHTML = data.html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: React.CSSProperties = {
    borderLeft: "4px solid #C9B59C",
    paddingLeft: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "15px",
    fontStyle: "italic",
    lineHeight: 1.7,
    color: "#555",
    outline: "none",
    minHeight: "1.5em",
    wordBreak: "break-word",
  };

  const authorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#888",
    marginTop: "6px",
    outline: "none",
    minWidth: "60px",
  };

  if (readOnly) {
    return (
      <blockquote style={containerStyle}>
        <div style={textStyle} dangerouslySetInnerHTML={{ __html: data.html || "&nbsp;" }} />
        {data.author && (
          <div style={authorStyle}>— {data.author}</div>
        )}
      </blockquote>
    );
  }

  return (
    <blockquote style={containerStyle}>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        style={textStyle}
        onInput={() => {
          if (!ref.current || !onChange) return;
          onChange({ ...data, html: ref.current.innerHTML });
        }}
        data-placeholder="Write a quote..."
      />
      <div style={{ display: "flex", alignItems: "center", marginTop: "6px" }}>
        <span style={{ color: "#aaa", marginRight: "4px", fontSize: "12px" }}>—</span>
        <span
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange?.({ ...data, author: (e.currentTarget as HTMLElement).textContent ?? data.author })}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ ...authorStyle, display: "inline-block" }}
          data-placeholder="Author"
        >
          {data.author}
        </span>
      </div>
    </blockquote>
  );
}
