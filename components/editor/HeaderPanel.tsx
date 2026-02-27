"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { createHeader, deleteHeader } from "@/app/actions/actions";

type Header = {
  id: string;
  title: string;
  content: string | null;
  order: number;
  parentId: string | null;
};

type Props = {
  projectId: string;
  headers: Header[];
  onHeadersChange: (headers: Header[]) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
};

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
        const header = await createHeader(
          projectId,
          newTitle.trim(),
          newParentId || undefined
        );
        onHeadersChange([...headers, header]);
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

  function closeModal() {
    setShowModal(false);
    setNewTitle("");
    setNewParentId("");
  }

  return (
    <>
      <div
        className="flex flex-col border-r flex-shrink-0"
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
          {displayOrder.map((header) => {
            const number = numbering.get(header.id) ?? "";
            const isChild = header.parentId !== null;
            const isSelected = selectedId === header.id;
            return (
              <div
                key={header.id}
                onClick={() => onSelect(header.id)}
                className="flex items-center justify-between py-2.5 cursor-pointer text-sm border-b group transition-colors"
                style={{
                  paddingLeft: isChild ? "28px" : "16px",
                  paddingRight: "12px",
                  borderColor: "var(--color-border)",
                  backgroundColor: isSelected ? "var(--color-border)" : "transparent",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <span className="truncate flex items-center gap-1.5 min-w-0">
                  {isChild && (
                    <span style={{ color: "var(--color-border)", fontSize: "10px" }}>└</span>
                  )}
                  <span
                    className="text-xs font-mono flex-shrink-0"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {number}
                  </span>
                  <span className="truncate">{header.title}</span>
                </span>
                <button
                  onClick={(e) => handleDelete(header.id, e)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-base leading-none ml-1 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.40)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="rounded-xl shadow-xl p-6 flex flex-col gap-4"
            style={{
              width: "380px",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3 className="text-base font-semibold">New Header</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#888" }}>
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") closeModal();
                }}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
                placeholder="e.g. Introduction"
                autoFocus
              />
            </div>

            {topLevelHeaders.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: "#888" }}>
                  Parent Header (optional)
                </label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <option value="">None — top-level</option>
                  {topLevelHeaders.map((h) => (
                    <option key={h.id} value={h.id}>
                      {numbering.get(h.id)} {h.title}
                    </option>
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
