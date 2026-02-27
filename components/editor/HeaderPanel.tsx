"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createHeader, deleteHeader, updateHeader, reorderHeaders } from "@/app/actions/actions";

type Header = {
  id: string;
  title: string;
  content: string | null;
  order: number;
  parentId: string | null;
  icon: string | null;
};

type Props = {
  projectId: string;
  headers: Header[];
  onHeadersChange: (headers: Header[]) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
};

const EMOJI_LIST = [
  "📄", "📝", "📚", "📖", "🔧", "⚙️", "🚀", "💡", "🎯", "🔍",
  "✅", "⚠️", "❌", "🔥", "💎", "🌟", "🎉", "🛡️", "📊", "📈", "🗂️",
];

function computeNumbering(headers: Header[]): Map<string, string> {
  const map = new Map<string, string>();
  const topLevel = headers.filter((h) => h.parentId === null);
  topLevel.forEach((h, i) => {
    const num = String(i + 1);
    map.set(h.id, num);
    const children = headers.filter((c) => c.parentId === h.id);
    children.forEach((c, j) => {
      map.set(c.id, `${num}.${j + 1}`);
    });
  });
  return map;
}

function buildDisplayOrder(headers: Header[]): Header[] {
  const topLevel = headers.filter((h) => h.parentId === null);
  const result: Header[] = [];
  for (const h of topLevel) {
    result.push(h);
    const children = headers.filter((c) => c.parentId === h.id);
    result.push(...children);
  }
  return result;
}

function SortableHeaderRow({
  header,
  numbering,
  isSelected,
  renamingId,
  onSelect,
  onDelete,
  onStartRename,
  onCommitRename,
  onEmojiSelect,
  emojiPickerId,
  onToggleEmojiPicker,
}: {
  header: Header;
  numbering: Map<string, string>;
  isSelected: boolean;
  renamingId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onStartRename: (id: string) => void;
  onCommitRename: (id: string, title: string) => void;
  onEmojiSelect: (id: string, emoji: string) => void;
  emojiPickerId: string | null;
  onToggleEmojiPicker: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.id });

  const [renameValue, setRenameValue] = useState(header.title);
  const isChild = header.parentId !== null;
  const number = numbering.get(header.id) ?? "";
  const showEmojiPicker = emojiPickerId === header.id;

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className="group"
    >
      <div
        onClick={() => onSelect(header.id)}
        className="flex items-center justify-between py-2 cursor-pointer text-sm border-b"
        style={{
          paddingLeft: isChild ? "28px" : "12px",
          paddingRight: "8px",
          borderColor: "var(--color-border)",
          backgroundColor: isSelected ? "var(--color-border)" : "transparent",
          fontWeight: isSelected ? 600 : 400,
          position: "relative",
        }}
        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.03)"; }}
        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
      >
        <div
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          style={{
            cursor: "grab",
            color: "#ccc",
            fontSize: "12px",
            padding: "0 2px",
            opacity: 0,
            flexShrink: 0,
          }}
          className="drag-handle-header"
        >
          ⠿
        </div>

        <span className="truncate flex items-center gap-1 min-w-0 flex-1 ml-1">
          {isChild && (
            <span style={{ color: "var(--color-border)", fontSize: "10px", flexShrink: 0 }}>└</span>
          )}

          <span
            onClick={(e) => { e.stopPropagation(); onToggleEmojiPicker(header.id); }}
            style={{ fontSize: "14px", cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
            title="Set emoji icon"
          >
            {header.icon || "·"}
          </span>

          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); onToggleEmojiPicker(header.id); }} />
              <div
                className="absolute z-40 p-2 rounded-lg border shadow-xl"
                style={{
                  top: "100%",
                  left: "0",
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  width: "180px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => { e.stopPropagation(); onEmojiSelect(header.id, emoji); }}
                      style={{ fontSize: "16px", padding: "3px", borderRadius: "4px", border: "none", background: "transparent", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-alt)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <span
            className="text-xs font-mono flex-shrink-0"
            style={{ color: "var(--color-accent)" }}
          >
            {number}
          </span>

          {renamingId === header.id ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => onCommitRename(header.id, renameValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCommitRename(header.id, renameValue);
                if (e.key === "Escape") onCommitRename(header.id, header.title);
              }}
              onClick={(e) => e.stopPropagation()}
              className="outline-none bg-transparent border-b text-sm min-w-0 flex-1"
              style={{ borderColor: "var(--color-accent)" }}
            />
          ) : (
            <span
              className="truncate"
              onDoubleClick={(e) => { e.stopPropagation(); onStartRename(header.id); }}
              title="Double-click to rename"
            >
              {header.title}
            </span>
          )}
        </span>

        <button
          onClick={(e) => onDelete(header.id, e)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-base leading-none ml-1 flex-shrink-0"
        >
          ×
        </button>
      </div>
      <style>{`.group:hover .drag-handle-header { opacity: 1 !important; }`}</style>
    </div>
  );
}

export default function HeaderPanel({
  projectId,
  headers,
  onHeadersChange,
  selectedId,
  onSelect,
  searchQuery = "",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [emojiPickerId, setEmojiPickerId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const numbering = computeNumbering(headers);
  const topLevelHeaders = headers.filter((h) => h.parentId === null);

  const filteredHeaders = searchQuery.trim()
    ? (() => {
        const q = searchQuery.toLowerCase();
        const matchIds = new Set<string>();
        headers.forEach((h) => {
          if (h.title.toLowerCase().includes(q)) {
            matchIds.add(h.id);
            if (h.parentId) matchIds.add(h.parentId);
          }
        });
        return headers.filter((h) => matchIds.has(h.id));
      })()
    : headers;

  const displayOrder = buildDisplayOrder(filteredHeaders);

  function handleAdd() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      try {
        const header = await createHeader(projectId, newTitle.trim(), newParentId || undefined);
        onHeadersChange([...headers, { ...header, icon: "" }]);
        setNewTitle("");
        setNewParentId("");
        setShowModal(false);
        onSelect(header.id);
        toast.success("Header added");
      } catch {
        toast.error("Failed to add header");
      }
    });
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await deleteHeader(id);
        const next = headers.filter((h) => h.id !== id && h.parentId !== id);
        onHeadersChange(next);
        if (selectedId === id) {
          onSelect(next[0]?.id ?? "");
        }
        toast.success("Header deleted");
      } catch {
        toast.error("Failed to delete header");
      }
    });
  }

  function handleStartRename(id: string) {
    setRenamingId(id);
    setEmojiPickerId(null);
  }

  function handleCommitRename(id: string, title: string) {
    setRenamingId(null);
    const original = headers.find((h) => h.id === id)?.title ?? "";
    if (!title.trim() || title === original) return;
    startTransition(async () => {
      try {
        await updateHeader(id, { title: title.trim() });
        onHeadersChange(headers.map((h) => (h.id === id ? { ...h, title: title.trim() } : h)));
      } catch {
        toast.error("Failed to rename");
      }
    });
  }

  function handleEmojiSelect(id: string, emoji: string) {
    setEmojiPickerId(null);
    startTransition(async () => {
      try {
        await updateHeader(id, { icon: emoji });
        onHeadersChange(headers.map((h) => (h.id === id ? { ...h, icon: emoji } : h)));
      } catch {
        toast.error("Failed to set emoji");
      }
    });
  }

  function handleToggleEmojiPicker(id: string) {
    setEmojiPickerId((prev) => (prev === id ? null : id));
    setRenamingId(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = displayOrder.map((h) => h.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);

    const activeHeader = headers.find((h) => h.id === active.id);
    const overHeader = headers.find((h) => h.id === over.id);
    if (activeHeader?.parentId !== overHeader?.parentId) return;

    const reordered = arrayMove(displayOrder, oldIdx, newIdx);
    onHeadersChange(reordered);
    try {
      await reorderHeaders(projectId, reordered.map((h) => h.id));
    } catch {
      toast.error("Failed to reorder");
    }
  }

  function closeModal() {
    setShowModal(false);
    setNewTitle("");
    setNewParentId("");
  }

  return (
    <>
      <div
        className="flex flex-col border-r flex-shrink-0 overflow-hidden"
        style={{
          width: "240px",
          minWidth: "240px",
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg-alt)",
        }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span className="text-sm font-semibold">Headers</span>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs px-2 py-1 rounded-md text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayOrder.length === 0 && (
            <div className="px-4 py-6 text-xs text-center" style={{ color: "#aaa" }}>
              No headers yet. Click + New to add one.
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayOrder.map((h) => h.id)} strategy={verticalListSortingStrategy}>
              {displayOrder.map((header) => (
                <SortableHeaderRow
                  key={header.id}
                  header={header}
                  numbering={numbering}
                  isSelected={selectedId === header.id}
                  renamingId={renamingId}
                  onSelect={onSelect}
                  onDelete={handleDelete}
                  onStartRename={handleStartRename}
                  onCommitRename={handleCommitRename}
                  onEmojiSelect={handleEmojiSelect}
                  emojiPickerId={emojiPickerId}
                  onToggleEmojiPicker={handleToggleEmojiPicker}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.40)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="rounded-xl shadow-xl p-6 flex flex-col gap-4"
            style={{ width: "380px", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}
          >
            <h3 className="text-base font-semibold">New Header</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#888" }}>Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") closeModal(); }}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
                placeholder="e.g. Introduction"
                autoFocus
              />
            </div>
            {topLevelHeaders.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: "#888" }}>Parent Header (optional)</label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
                >
                  <option value="">None — top-level</option>
                  {topLevelHeaders.map((h) => (
                    <option key={h.id} value={h.id}>{numbering.get(h.id)} {h.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleAdd}
                disabled={isPending || !newTitle.trim()}
                className="flex-1 py-2 text-sm rounded-md text-white font-medium disabled:opacity-60"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                {isPending ? "Adding..." : "Add Header"}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2 text-sm rounded-md border font-medium"
                style={{ borderColor: "var(--color-border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
