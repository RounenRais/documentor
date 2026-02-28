"use client";

import type { Block, BlockData, TextBlockData, HeadingBlockData, CodeBlockData, CalloutBlockData, ImageBlockData, DividerBlockData, ButtonBlockData, BadgeBlockData } from "./types";

type BlockWidth = Block["width"];

type Props = {
  block: Block;
  index: number;
  total: number;
  blockWidth?: BlockWidth;
  onChange: (data: BlockData) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBelow: () => void;
  onWidthChange?: (width: BlockWidth) => void;
};

const LANGS = ["typescript", "javascript", "python", "bash", "html", "css", "json", "sql", "go", "rust", "java", "cpp"];

function Btn({ onClick, title, children, style }: { onClick: () => void; title?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      style={{
        padding: "2px 6px",
        fontSize: "11px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#555",
        borderRadius: "3px",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-alt)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span style={{ width: "1px", height: "14px", backgroundColor: "#D9CFC7", flexShrink: 0 }} />;
}

export default function BlockToolbar({ block, index, total, blockWidth, onChange, onMoveUp, onMoveDown, onDuplicate, onDelete, onInsertBelow, onWidthChange }: Props) {
  const d = block.data;

  const renderTypeControls = () => {
    switch (d.type) {
      case "text": {
        const td = d as TextBlockData;
        return (
          <>
            <Sep />
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              Size
              <input
                type="number"
                value={td.fontSize}
                min={10}
                max={48}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => onChange({ ...td, fontSize: Number(e.target.value) })}
                style={{ width: "38px", fontSize: "11px", padding: "1px 3px", border: "1px solid #D9CFC7", borderRadius: "3px" }}
              />
            </label>
            <Btn onClick={() => onChange({ ...td, fontWeight: td.fontWeight === "bold" ? "normal" : "bold" })}>
              <b>B</b>
            </Btn>
            {(["left", "center", "right"] as const).map((a) => (
              <Btn key={a} onClick={() => onChange({ ...td, align: a })} style={{ opacity: td.align === a ? 1 : 0.4 }}>
                {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
              </Btn>
            ))}
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              <input type="color" value={td.color || "#1a1a1a"} onPointerDown={(e) => e.stopPropagation()} onChange={(e) => onChange({ ...td, color: e.target.value })} style={{ width: "18px", height: "18px", border: "none", cursor: "pointer" }} />
            </label>
          </>
        );
      }
      case "heading": {
        const hd = d as HeadingBlockData;
        return (
          <>
            <Sep />
            <select
              value={hd.level}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...hd, level: Number(e.target.value) as 1 | 2 | 3 })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
            {(["left", "center", "right"] as const).map((a) => (
              <Btn key={a} onClick={() => onChange({ ...hd, align: a })} style={{ opacity: hd.align === a ? 1 : 0.4 }}>
                {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
              </Btn>
            ))}
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              <input type="color" value={hd.color || "#1a1a1a"} onPointerDown={(e) => e.stopPropagation()} onChange={(e) => onChange({ ...hd, color: e.target.value })} style={{ width: "18px", height: "18px", border: "none", cursor: "pointer" }} />
            </label>
          </>
        );
      }
      case "code": {
        const cd = d as CodeBlockData;
        return (
          <>
            <Sep />
            <select
              value={cd.language}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...cd, language: e.target.value })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <Btn onClick={() => onChange({ ...cd, theme: cd.theme === "dark" ? "light" : "dark" })}>
              {cd.theme === "dark" ? "☀️" : "🌙"}
            </Btn>
          </>
        );
      }
      case "callout": {
        const cal = d as CalloutBlockData;
        return (
          <>
            <Sep />
            <select
              value={cal.variant}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...cal, variant: e.target.value as CalloutBlockData["variant"] })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
              <option value="success">Success</option>
            </select>
          </>
        );
      }
      case "image": {
        const img = d as ImageBlockData;
        return (
          <>
            <Sep />
            <select
              value={img.size}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...img, size: e.target.value as ImageBlockData["size"] })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="full">Full</option>
            </select>
            {(["left", "center", "right"] as const).map((a) => (
              <Btn key={a} onClick={() => onChange({ ...img, align: a })} style={{ opacity: img.align === a ? 1 : 0.4 }}>
                {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
              </Btn>
            ))}
          </>
        );
      }
      case "divider": {
        const dv = d as DividerBlockData;
        return (
          <>
            <Sep />
            <select
              value={dv.borderStyle}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...dv, borderStyle: e.target.value as DividerBlockData["borderStyle"] })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
            <select
              value={dv.thickness}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...dv, thickness: Number(e.target.value) as 1 | 2 | 4 })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value={1}>1px</option>
              <option value={2}>2px</option>
              <option value={4}>4px</option>
            </select>
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              <input type="color" value={dv.borderColor || "#D9CFC7"} onPointerDown={(e) => e.stopPropagation()} onChange={(e) => onChange({ ...dv, borderColor: e.target.value })} style={{ width: "18px", height: "18px", border: "none", cursor: "pointer" }} />
            </label>
          </>
        );
      }
      case "button": {
        const btn = d as ButtonBlockData;
        return (
          <>
            <Sep />
            <select
              value={btn.variant}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...btn, variant: e.target.value as ButtonBlockData["variant"] })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value="filled">Filled</option>
              <option value="outlined">Outlined</option>
              <option value="ghost">Ghost</option>
            </select>
            <select
              value={btn.size}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...btn, size: e.target.value as ButtonBlockData["size"] })}
              style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
            >
              <option value="sm">Sm</option>
              <option value="md">Md</option>
              <option value="lg">Lg</option>
            </select>
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              <input type="color" value={btn.color || "#C9B59C"} onPointerDown={(e) => e.stopPropagation()} onChange={(e) => onChange({ ...btn, color: e.target.value })} style={{ width: "18px", height: "18px", border: "none", cursor: "pointer" }} />
            </label>
          </>
        );
      }
      case "badge": {
        const bg = d as BadgeBlockData;
        return (
          <>
            <Sep />
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              Bg <input type="color" value={bg.bgColor || "#EFE9E3"} onPointerDown={(e) => e.stopPropagation()} onChange={(e) => onChange({ ...bg, bgColor: e.target.value })} style={{ width: "18px", height: "18px", border: "none", cursor: "pointer" }} />
            </label>
            <label style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}>
              Txt <input type="color" value={bg.textColor || "#1a1a1a"} onPointerDown={(e) => e.stopPropagation()} onChange={(e) => onChange({ ...bg, textColor: e.target.value })} style={{ width: "18px", height: "18px", border: "none", cursor: "pointer" }} />
            </label>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "-40px",
        left: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "3px 6px",
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <Btn onClick={onMoveUp} title="Move up" style={{ opacity: index === 0 ? 0.3 : 1 }}>↑</Btn>
      <Btn onClick={onMoveDown} title="Move down" style={{ opacity: index === total - 1 ? 0.3 : 1 }}>↓</Btn>
      <Sep />
      <Btn onClick={onDuplicate} title="Duplicate">⎘</Btn>
      <Btn onClick={onInsertBelow} title="Insert block below">+</Btn>
      <Sep />
      <span style={{ fontSize: "11px", color: "#aaa", padding: "0 3px" }}>{d.type}</span>
      {renderTypeControls()}
      {onWidthChange && (
        <>
          <Sep />
          <select
            value={blockWidth ?? "full"}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => onWidthChange(e.target.value as BlockWidth)}
            title="Block width"
            style={{ fontSize: "11px", border: "1px solid #D9CFC7", borderRadius: "3px", padding: "1px 3px" }}
          >
            <option value="full">Full</option>
            <option value="1/2">1/2</option>
            <option value="1/3">1/3</option>
            <option value="2/3">2/3</option>
          </select>
        </>
      )}
      <Sep />
      <Btn onClick={onDelete} title="Delete block" style={{ color: "#ef4444" }}>🗑</Btn>
    </div>
  );
}
