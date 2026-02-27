"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import toast from "react-hot-toast";
import { updateHeader } from "@/app/actions/actions";
import { useHistory } from "@/hooks/useHistory";

type Header = {
  id: string;
  title: string;
  content: string | null;
};

type FormatType =
  | "bold"
  | "italic"
  | "code-inline"
  | "link"
  | "h1"
  | "h2"
  | "quote"
  | "list"
  | "ordered-list"
  | "info-block"
  | "warning-block"
  | "table"
  | "image"
  | "divider";

type Props = {
  header: Header | null;
  onContentChange?: (id: string, content: string) => void;
};

const LANGS = [
  "javascript",
  "typescript",
  "python",
  "bash",
  "html",
  "css",
  "json",
  "sql",
  "go",
  "rust",
  "java",
  "cpp",
];

const TOOLBAR_GROUPS: { type: FormatType; label: string; title: string }[][] = [
  [
    { type: "h1", label: "H1", title: "Heading 1" },
    { type: "h2", label: "H2", title: "Heading 2" },
    { type: "bold", label: "B", title: "Bold" },
    { type: "italic", label: "I", title: "Italic" },
  ],
  [
    { type: "code-inline", label: "`", title: "Inline Code" },
    { type: "link", label: "URL", title: "Link" },
    { type: "quote", label: "❝", title: "Blockquote" },
    { type: "list", label: "•", title: "Unordered List" },
    { type: "ordered-list", label: "1.", title: "Ordered List" },
  ],
  [
    { type: "info-block", label: "ℹ", title: "Info Block" },
    { type: "warning-block", label: "⚠", title: "Warning Block" },
    { type: "table", label: "⊞", title: "Table" },
    { type: "image", label: "⬜", title: "Image" },
    { type: "divider", label: "—", title: "Horizontal Rule" },
  ],
];

function Sep() {
  return (
    <span
      className="inline-block w-px h-4 mx-1 flex-shrink-0"
      style={{ backgroundColor: "var(--color-border)" }}
    />
  );
}

export default function ContentEditor({ header, onContentChange }: Props) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [content, setContent] = useState(header?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { push, pushImmediate, undo, redo, canUndo, canRedo } = useHistory(
    header?.content ?? ""
  );

  useEffect(() => {
    setContent(header?.content ?? "");
    setUnsaved(false);
  }, [header?.id, header?.content]);

  function applyValue(value: string, immediate = false) {
    setContent(value);
    setUnsaved(true);
    if (immediate) pushImmediate(value);
    else push(value);
    if (header) onContentChange?.(header.id, value);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const val = undo();
        if (val !== null && header) {
          setContent(val);
          setUnsaved(true);
          onContentChange?.(header.id, val);
        }
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        const val = redo();
        if (val !== null && header) {
          setContent(val);
          setUnsaved(true);
          onContentChange?.(header.id, val);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [header, undo, redo, onContentChange]);

  const save = useCallback(
    async (value: string) => {
      if (!header) return;
      setSaving(true);
      try {
        await updateHeader(header.id, { content: value });
        setUnsaved(false);
        toast.success("Saved");
      } catch {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [header]
  );

  useEffect(() => {
    if (!header || !unsaved) return;
    const t = setTimeout(() => save(content), 1500);
    return () => clearTimeout(t);
  }, [content, header, unsaved, save]);

  function applyFormat(type: FormatType) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = content.slice(start, end);
    let insert = "";

    switch (type) {
      case "bold":
        insert = `**${sel || "bold text"}**`;
        break;
      case "italic":
        insert = `*${sel || "italic text"}*`;
        break;
      case "code-inline":
        insert = `\`${sel || "code"}\``;
        break;
      case "link":
        insert = sel ? `[${sel}](url)` : `[link text](url)`;
        break;
      case "h1":
        insert = `# ${sel || "Heading 1"}`;
        break;
      case "h2":
        insert = `## ${sel || "Heading 2"}`;
        break;
      case "quote":
        insert = `> ${sel || "blockquote"}`;
        break;
      case "list":
        insert = sel
          ? sel
              .split("\n")
              .map((l) => `- ${l}`)
              .join("\n")
          : `- item`;
        break;
      case "ordered-list":
        insert = sel
          ? sel
              .split("\n")
              .map((l, i) => `${i + 1}. ${l}`)
              .join("\n")
          : `1. item`;
        break;
      case "info-block":
        insert = `> ℹ️ **Note:** ${sel || "Add your info here"}`;
        break;
      case "warning-block":
        insert = `> ⚠️ **Warning:** ${sel || "Add your warning here"}`;
        break;
      case "table":
        insert = `| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell     | Cell     | Cell     |\n| Cell     | Cell     | Cell     |`;
        break;
      case "image":
        insert = `![${sel || "alt text"}](https://example.com/image.png)`;
        break;
      case "divider":
        insert = `\n\n---\n\n`;
        break;
    }

    const newContent = content.slice(0, start) + insert + content.slice(end);
    applyValue(newContent, true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, start + insert.length);
    });
  }

  function applyCodeBlock(lang: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = content.slice(start, end);
    const insert = `\`\`\`${lang}\n${sel || "// code here"}\n\`\`\``;
    const newContent = content.slice(0, start) + insert + content.slice(end);
    applyValue(newContent, true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, start + insert.length);
    });
  }

  if (!header) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)", color: "#aaa" }}
      >
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No header selected</p>
          <p className="text-sm">Select a header from the left panel or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="flex items-center justify-between px-6 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-alt)" }}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">{header.title}</h2>
          {unsaved && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#f97316" }}
              title="Unsaved changes"
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs" style={{ color: "#aaa" }}>
              Saving...
            </span>
          )}
          <div
            className="flex rounded-md border overflow-hidden"
            style={{ borderColor: "var(--color-border)" }}
          >
            <button
              onClick={() => setMode("write")}
              className="px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: mode === "write" ? "var(--color-accent)" : "transparent",
                color: mode === "write" ? "#fff" : "#666",
              }}
            >
              Write
            </button>
            <button
              onClick={() => setMode("preview")}
              className="px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: mode === "preview" ? "var(--color-accent)" : "transparent",
                color: mode === "preview" ? "#fff" : "#666",
              }}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {mode === "write" && (
        <div
          className="flex items-center px-3 py-1.5 border-b flex-shrink-0 gap-0.5 flex-wrap"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-alt)" }}
        >
          {TOOLBAR_GROUPS.map((group, gi) => (
            <span key={gi} className="flex items-center gap-0.5">
              {gi > 0 && <Sep />}
              {group.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => applyFormat(btn.type)}
                  title={btn.title}
                  className="px-2 py-1 text-xs rounded transition-opacity hover:opacity-60 flex-shrink-0"
                  style={{
                    minWidth: "28px",
                    fontWeight: btn.type === "bold" ? 700 : 500,
                    fontStyle: btn.type === "italic" ? "italic" : "normal",
                    fontFamily: ["code-inline", "ordered-list"].includes(btn.type)
                      ? "monospace"
                      : "inherit",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </span>
          ))}

          <span className="flex items-center gap-0.5">
            <Sep />
            <div className="relative">
              <button
                onClick={() => setShowLangPicker((v) => !v)}
                title="Code Block"
                className="px-2 py-1 text-xs rounded font-mono transition-opacity hover:opacity-60 flex-shrink-0"
                style={{ minWidth: "36px" }}
              >
                {"{ }"}
              </button>
              {showLangPicker && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLangPicker(false)}
                  />
                  <div
                    className="absolute top-full left-0 mt-1 z-20 rounded-lg border shadow-md p-1 grid grid-cols-2 gap-0.5"
                    style={{
                      width: "180px",
                      backgroundColor: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    {LANGS.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          applyCodeBlock(lang);
                          setShowLangPicker(false);
                        }}
                        className="text-left px-2 py-1.5 text-xs rounded font-mono"
                        style={{ backgroundColor: "transparent" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.backgroundColor =
                            "var(--color-bg-alt)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                        }
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </span>

          <span className="flex items-center gap-0.5 ml-auto">
            <Sep />
            <button
              onClick={() => {
                const val = undo();
                if (val !== null && header) {
                  setContent(val);
                  setUnsaved(true);
                  onContentChange?.(header.id, val);
                }
              }}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="px-2 py-1 text-xs rounded transition-opacity hover:opacity-60 disabled:opacity-20"
            >
              ↩
            </button>
            <button
              onClick={() => {
                const val = redo();
                if (val !== null && header) {
                  setContent(val);
                  setUnsaved(true);
                  onContentChange?.(header.id, val);
                }
              }}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="px-2 py-1 text-xs rounded transition-opacity hover:opacity-60 disabled:opacity-20"
            >
              ↪
            </button>
          </span>
        </div>
      )}

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => applyValue(e.target.value)}
          className="flex-1 w-full p-6 text-sm font-mono outline-none resize-none"
          style={{ backgroundColor: "var(--color-bg)", lineHeight: "1.7" }}
          placeholder={`# ${header.title}\n\nStart writing in Markdown...\n\n\`\`\`javascript\nconsole.log('Hello world');\n\`\`\``}
        />
      ) : (
        <div
          className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ className, children, ...props }) {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{
                      backgroundColor: "var(--color-bg-alt)",
                      border: "1px solid var(--color-border)",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {content || "*Nothing to preview yet.*"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
