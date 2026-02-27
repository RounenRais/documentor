"use client";

import { useState, useEffect, useRef } from "react";
import type { CodeBlockData } from "../types";

type Props = {
  data: CodeBlockData;
  onChange?: (data: CodeBlockData) => void;
  readOnly?: boolean;
};

const LANGS = ["typescript", "javascript", "python", "bash", "html", "css", "json", "sql", "go", "rust", "java", "cpp"];

export default function CodeBlock({ data, onChange, readOnly }: Props) {
  const [showPreview, setShowPreview] = useState(true);
  const [highlighted, setHighlighted] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function highlight() {
      try {
        const hljs = (await import("highlight.js")).default;
        const lang = hljs.getLanguage(data.language) ? data.language : "plaintext";
        const result = hljs.highlight(data.code || "", { language: lang });
        if (!cancelled) setHighlighted(result.value);
      } catch {
        if (!cancelled) setHighlighted(data.code || "");
      }
    }
    highlight();
    return () => { cancelled = true; };
  }, [data.code, data.language]);

  const darkStyle: React.CSSProperties = {
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    border: "1px solid #3a3a3a",
  };
  const lightStyle: React.CSSProperties = {
    backgroundColor: "#f6f8fa",
    color: "#1a1a1a",
    border: "1px solid #D9CFC7",
  };
  const containerStyle = data.theme === "dark" ? darkStyle : lightStyle;

  if (readOnly) {
    return (
      <div style={{ ...containerStyle, borderRadius: "8px", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            borderBottom: `1px solid ${data.theme === "dark" ? "#3a3a3a" : "#D9CFC7"}`,
            fontSize: "11px",
            color: data.theme === "dark" ? "#888" : "#666",
          }}
        >
          <span>{data.language}</span>
        </div>
        <pre
          style={{ margin: 0, padding: "12px 16px", overflowX: "auto", fontSize: "13px", fontFamily: "monospace", lineHeight: 1.6 }}
        >
          <code
            className={`language-${data.language}`}
            dangerouslySetInnerHTML={{ __html: highlighted || data.code }}
          />
        </pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ ...containerStyle, borderRadius: "8px", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderBottom: `1px solid ${data.theme === "dark" ? "#3a3a3a" : "#D9CFC7"}`,
        }}
      >
        <select
          value={data.language}
          onChange={(e) => onChange?.({ ...data, language: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            fontSize: "11px",
            background: "transparent",
            border: "none",
            color: data.theme === "dark" ? "#888" : "#666",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setShowPreview((v) => !v)}
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            background: "transparent",
            border: "none",
            color: data.theme === "dark" ? "#888" : "#666",
            cursor: "pointer",
          }}
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>
      {showPreview ? (
        <pre
          style={{ margin: 0, padding: "12px 16px", overflowX: "auto", fontSize: "13px", fontFamily: "monospace", lineHeight: 1.6, cursor: "text" }}
          onClick={() => setShowPreview(false)}
        >
          <code
            className={`language-${data.language}`}
            dangerouslySetInnerHTML={{ __html: highlighted || data.code || '<span style="color:#aaa">Click Edit to write code...</span>' }}
          />
        </pre>
      ) : (
        <textarea
          autoFocus
          value={data.code}
          onChange={(e) => onChange?.({ ...data, code: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={() => setShowPreview(true)}
          style={{
            display: "block",
            width: "100%",
            minHeight: "120px",
            padding: "12px 16px",
            fontSize: "13px",
            fontFamily: "monospace",
            lineHeight: 1.6,
            background: "transparent",
            border: "none",
            outline: "none",
            color: data.theme === "dark" ? "#d4d4d4" : "#1a1a1a",
            resize: "vertical",
          }}
          placeholder="// Write your code here..."
        />
      )}
    </div>
  );
}
