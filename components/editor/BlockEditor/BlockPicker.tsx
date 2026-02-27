"use client";

import type { BlockType } from "./types";

type Props = {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
};

const BLOCK_TYPES: { type: BlockType; icon: string; label: string; description: string }[] = [
  { type: "text", icon: "T", label: "Text", description: "Plain paragraph" },
  { type: "heading", icon: "H", label: "Heading", description: "H1, H2, or H3 title" },
  { type: "code", icon: "</>", label: "Code", description: "Syntax highlighted code" },
  { type: "callout", icon: "ℹ", label: "Callout", description: "Info, warning, success box" },
  { type: "image", icon: "⬜", label: "Image", description: "Image with caption" },
  { type: "table", icon: "⊞", label: "Table", description: "Editable grid" },
  { type: "divider", icon: "—", label: "Divider", description: "Horizontal separator" },
  { type: "button", icon: "⬡", label: "Button", description: "Linked button element" },
  { type: "badge", icon: "◉", label: "Badge", description: "Inline label badge" },
  { type: "quote", icon: "❝", label: "Quote", description: "Block quotation" },
];

export default function BlockPicker({ onSelect, onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-xl shadow-2xl border p-4"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "480px",
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Add a block</h3>
          <button
            onClick={onClose}
            className="text-base leading-none"
            style={{ color: "#aaa" }}
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_TYPES.map((b) => (
            <button
              key={b.type}
              onClick={() => { onSelect(b.type); onClose(); }}
              className="flex items-center gap-3 p-3 rounded-lg border text-left transition-colors"
              style={{ borderColor: "var(--color-border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span
                className="flex items-center justify-center rounded-md text-sm font-mono flex-shrink-0"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {b.icon}
              </span>
              <div>
                <div className="text-sm font-medium">{b.label}</div>
                <div className="text-xs" style={{ color: "#888" }}>{b.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
