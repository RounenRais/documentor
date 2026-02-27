"use client";

import { useRef, useEffect } from "react";
import type { TextBlockData } from "../types";

type Props = {
  data: TextBlockData;
  onChange?: (data: TextBlockData) => void;
  readOnly?: boolean;
};

export default function TextBlock({ data, onChange, readOnly }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== data.html) {
      ref.current.innerHTML = data.html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style: React.CSSProperties = {
    textAlign: data.align,
    fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
    fontWeight: data.fontWeight === "bold" ? 700 : 400,
    color: data.color || undefined,
    backgroundColor: data.bgColor || undefined,
    minHeight: "1.5em",
    outline: "none",
    lineHeight: 1.7,
    padding: "2px 0",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  if (readOnly) {
    return (
      <div
        style={style}
        dangerouslySetInnerHTML={{ __html: data.html || "<span style='color:#aaa'>Empty text block</span>" }}
      />
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={style}
      onInput={() => {
        if (!ref.current || !onChange) return;
        onChange({ ...data, html: ref.current.innerHTML });
      }}
      data-placeholder="Type something..."
      className="block-text-editable"
    />
  );
}
