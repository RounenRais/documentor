"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockData } from "./types";
import BlockToolbar from "./BlockToolbar";
import TextBlock from "./blocks/TextBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import CodeBlock from "./blocks/CodeBlock";
import CalloutBlock from "./blocks/CalloutBlock";
import ImageBlock from "./blocks/ImageBlock";
import TableBlock from "./blocks/TableBlock";
import DividerBlock from "./blocks/DividerBlock";
import ButtonBlock from "./blocks/ButtonBlock";
import BadgeBlock from "./blocks/BadgeBlock";
import QuoteBlock from "./blocks/QuoteBlock";

type Props = {
  block: Block;
  index: number;
  total: number;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, data: BlockData) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onInsertBelow: (id: string) => void;
};

function BlockRenderer({ block, onChange, readOnly }: { block: Block; onChange?: (data: BlockData) => void; readOnly?: boolean }) {
  const d = block.data;
  switch (d.type) {
    case "text":
      return <TextBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "heading":
      return <HeadingBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "code":
      return <CodeBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "callout":
      return <CalloutBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "image":
      return <ImageBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "table":
      return <TableBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "divider":
      return <DividerBlock key={block.id} data={d} readOnly={readOnly} />;
    case "button":
      return <ButtonBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "badge":
      return <BadgeBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
    case "quote":
      return <QuoteBlock key={block.id} data={d} onChange={onChange ? (nd) => onChange(nd) : undefined} readOnly={readOnly} />;
  }
}

export { BlockRenderer };

export default function BlockItem({
  block,
  index,
  total,
  isSelected,
  readOnly,
  onSelect,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertBelow,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
  };

  if (readOnly) {
    return (
      <div style={{ padding: "4px 0" }}>
        <BlockRenderer block={block} readOnly />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
      className="group"
    >
      <div
        style={{
          position: "relative",
          padding: "6px 8px 6px 28px",
          borderRadius: "6px",
          border: isSelected ? "2px solid #3b82f6" : "1px solid transparent",
          outline: isSelected ? "2px solid transparent" : undefined,
          outlineOffset: isSelected ? "2px" : undefined,
          transition: "border-color 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "transparent";
        }}
      >
        {isSelected && (
          <BlockToolbar
            block={block}
            index={index}
            total={total}
            onChange={(data) => onChange(block.id, data)}
            onMoveUp={() => onMoveUp(block.id)}
            onMoveDown={() => onMoveDown(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
            onDelete={() => onDelete(block.id)}
            onInsertBelow={() => onInsertBelow(block.id)}
          />
        )}

        <div
          {...listeners}
          style={{
            position: "absolute",
            left: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "grab",
            color: "#ccc",
            fontSize: "14px",
            lineHeight: 1,
            padding: "4px 2px",
            opacity: 0,
            transition: "opacity 0.1s",
          }}
          className="drag-handle"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </div>

        <BlockRenderer
          block={block}
          onChange={(data) => onChange(block.id, data)}
        />

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onInsertBelow(block.id); }}
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "#aaa",
            fontSize: "14px",
            lineHeight: "18px",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
          className="insert-below-btn"
          title="Insert block below"
        >
          +
        </button>
      </div>
    </div>
  );
}
