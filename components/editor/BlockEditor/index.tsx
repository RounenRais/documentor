"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { updateHeader } from "@/app/actions/actions";
import { useHistory } from "@/hooks/useHistory";
import { parseContent, createBlock, type Block, type BlockData, type BlockType } from "./types";

type BlockWidth = Block["width"];
import BlockItem from "./BlockItem";
import BlockPicker from "./BlockPicker";

type Header = {
  id: string;
  title: string;
  content: string | null;
};

type Props = {
  header: Header | null;
  onContentChange?: (id: string, content: string) => void;
};

export default function BlockEditor({ header, onContentChange }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseContent(header?.content ?? null));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [insertAfter, setInsertAfter] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const { push, undo, redo } = useHistory<Block[]>(blocks);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function applyBlocks(next: Block[]) {
    setBlocks(next);
    push(next);
    setUnsaved(true);
    if (header) onContentChange?.(header.id, JSON.stringify(next));
  }

  const save = useCallback(async () => {
    if (!header) return;
    setSaving(true);
    try {
      await updateHeader(header.id, { content: JSON.stringify(blocksRef.current) });
      setUnsaved(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [header]);

  useEffect(() => {
    if (!unsaved) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [unsaved, save, blocks]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const val = undo();
        if (val !== null) {
          setBlocks(val);
          setUnsaved(true);
          if (header) onContentChange?.(header.id, JSON.stringify(val));
        }
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        const val = redo();
        if (val !== null) {
          setBlocks(val);
          setUnsaved(true);
          if (header) onContentChange?.(header.id, JSON.stringify(val));
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [header, undo, redo, onContentChange]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    applyBlocks(arrayMove(blocks, oldIdx, newIdx));
  }

  function handleAddBlock(type: BlockType) {
    const block = createBlock(type);
    if (insertAfter) {
      const idx = blocks.findIndex((b) => b.id === insertAfter);
      const next = [...blocks.slice(0, idx + 1), block, ...blocks.slice(idx + 1)];
      applyBlocks(next);
    } else {
      applyBlocks([...blocks, block]);
    }
    setSelectedId(block.id);
  }

  function handleChange(id: string, data: BlockData) {
    applyBlocks(blocks.map((b) => (b.id === id ? { ...b, data } : b)));
  }

  function handleDelete(id: string) {
    applyBlocks(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleMoveUp(id: string) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    applyBlocks(arrayMove(blocks, idx, idx - 1));
  }

  function handleMoveDown(id: string) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx >= blocks.length - 1) return;
    applyBlocks(arrayMove(blocks, idx, idx + 1));
  }

  function handleWidthChange(id: string, width: BlockWidth) {
    applyBlocks(blocks.map((b) => (b.id === id ? { ...b, width } : b)));
  }

  function handleDuplicate(id: string) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const clone: Block = { id: crypto.randomUUID(), data: { ...blocks[idx].data } };
    const next = [...blocks.slice(0, idx + 1), clone, ...blocks.slice(idx + 1)];
    applyBlocks(next);
    setSelectedId(clone.id);
  }

  function handleInsertBelow(id: string) {
    setInsertAfter(id);
    setShowPicker(true);
  }

  function openPicker() {
    setInsertAfter(null);
    setShowPicker(true);
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
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
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
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs" style={{ color: "#aaa" }}>Saving...</span>}
          <span className="text-xs" style={{ color: "#aaa" }}>{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "var(--color-bg)" }}
        onClick={() => setSelectedId(null)}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px 120px" }}>
          {blocks.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              style={{ color: "#aaa" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
              <p className="font-medium mb-1">This section is empty</p>
              <p className="text-sm mb-6">Click the button below to add your first block</p>
              <button
                onClick={(e) => { e.stopPropagation(); openPicker(); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                + Add Block
              </button>
            </div>
          )}

          <style>{`
            .group:hover .drag-handle { opacity: 1 !important; }
            .group:hover .insert-below-btn { display: flex !important; }
          `}</style>

          <DndContext id="blocks-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "flex-start" }}>
                {blocks.map((block, index) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    index={index}
                    total={blocks.length}
                    isSelected={selectedId === block.id}
                    onSelect={setSelectedId}
                    onChange={handleChange}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onInsertBelow={handleInsertBelow}
                    onWidthChange={handleWidthChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {blocks.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); openPicker(); }}
              className="mt-6 w-full py-2.5 rounded-lg border text-sm font-medium transition-opacity hover:opacity-70"
              style={{ borderColor: "var(--color-border)", color: "#888", borderStyle: "dashed" }}
            >
              + Add Block
            </button>
          )}
        </div>
      </div>

      {showPicker && (
        <BlockPicker
          onSelect={handleAddBlock}
          onClose={() => { setShowPicker(false); setInsertAfter(null); }}
        />
      )}
    </div>
  );
}
