"use client";

import { useRef, useEffect } from "react";
import type { HeadingBlockData } from "../types";

type Props = {
  data: HeadingBlockData;
  onChange?: (data: HeadingBlockData) => void;
  readOnly?: boolean;
};

const SIZE_MAP = { 1: "2rem", 2: "1.5rem", 3: "1.25rem" } as const;
const WEIGHT_MAP = { 1: 800, 2: 700, 3: 600 } as const;

export default function HeadingBlock({ data, onChange, readOnly }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== data.html) {
      ref.current.innerHTML = data.html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style: React.CSSProperties = {
    textAlign: data.align,
    fontSize: SIZE_MAP[data.level],
    fontWeight: WEIGHT_MAP[data.level],
    color: data.color || undefined,
    outline: "none",
    minHeight: "1.2em",
    lineHeight: 1.3,
    padding: "2px 0",
    wordBreak: "break-word",
  };

  const Tag = (`h${data.level}`) as "h1" | "h2" | "h3";

  if (readOnly) {
    return (
      <Tag
        style={style}
        dangerouslySetInnerHTML={{ __html: data.html || "&nbsp;" }}
      />
    );
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      contentEditable
      suppressContentEditableWarning
      style={style}
      onInput={() => {
        if (!ref.current || !onChange) return;
        onChange({ ...data, html: ref.current.innerHTML });
      }}
    />
  );
}
