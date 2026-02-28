"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  DragEndEvent,
} from "@dnd-kit/core";
import toast from "react-hot-toast";
import {
  createNavbarItem,
  deleteNavbarItem,
  updateNavbarItem,
} from "@/app/actions/actions";

import { parseStyles, type ItemStyles } from "@/components/editor/BlockEditor/types";

type NavbarItem = {
  id: string;
  type: string;
  label: string | null;
  href: string | null;
  width: number | null;
  styles: string | null;
  order: number;
};

type ItemUpdate = { label?: string; href?: string; width?: number; styles?: string };

type Props = {
  projectId: string;
  projectName: string;
  initialItems: NavbarItem[];
  onSearch?: (query: string) => void;
};

const AVAILABLE_TOOLS = [
  { type: "title", label: "Project Title" },
  { type: "search", label: "Search Box" },
  { type: "link", label: "Link" },
  { type: "button", label: "Button" },
  { type: "badge", label: "Badge" },
  { type: "divider-v", label: "Divider" },
  { type: "github", label: "GitHub Link" },
  { type: "theme-toggle", label: "Theme Toggle" },
];

function GithubIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function getItemX(item: NavbarItem, index: number, allItems: NavbarItem[]): number {
  const styles = parseStyles(item.styles ?? "{}");
  if (typeof styles.x === "number") return styles.x;
  let x = 8;
  for (let i = 0; i < index; i++) {
    const w = allItems[i].type === "divider-v" ? 20 : (allItems[i].width ?? 120);
    const prevStyles = parseStyles(allItems[i].styles ?? "{}");
    x = typeof prevStyles.x === "number" ? prevStyles.x + w + 8 : x + w + 8;
  }
  return x;
}

function computeNextX(items: NavbarItem[]): number {
  if (items.length === 0) return 8;
  let maxRight = 8;
  items.forEach((item, i) => {
    const x = getItemX(item, i, items);
    const w = item.type === "divider-v" ? 20 : (item.width ?? 120);
    maxRight = Math.max(maxRight, x + w + 8);
  });
  return maxRight;
}

function DraggableNavItem({
  item,
  itemX,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onSearchChange,
}: {
  item: NavbarItem;
  itemX: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: ItemUpdate) => void;
  onSearchChange?: (value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(item.label ?? "");
  const [editingHref, setEditingHref] = useState(false);
  const [hrefValue, setHrefValue] = useState(item.href ?? "");
  const [searchValue, setSearchValue] = useState("");

  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const isResizing = useRef(false);
  const currentWidth = item.width ?? 120;

  const parsedStyles: ItemStyles = parseStyles(item.styles ?? "{}");

  const left = itemX + (transform?.x ?? 0);

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: `${left}px`,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: isDragging ? 20 : 1,
    width: item.type === "divider-v" ? "auto" : `${currentWidth}px`,
    minWidth: item.type === "divider-v" ? "auto" : `${currentWidth}px`,
    outline: isSelected ? "2px solid #3b82f6" : "none",
    outlineOffset: "2px",
    borderRadius: parsedStyles.borderRadius !== undefined ? `${parsedStyles.borderRadius}px` : undefined,
    ...(parsedStyles.bgColor ? { backgroundColor: parsedStyles.bgColor } : {}),
    ...(parsedStyles.textColor ? { color: parsedStyles.textColor } : {}),
    ...(parsedStyles.fontSize ? { fontSize: `${parsedStyles.fontSize}px` } : {}),
    ...(parsedStyles.padding ? { padding: parsedStyles.padding } : {}),
  };

  function commitLabel() {
    setEditingLabel(false);
    if (labelValue !== (item.label ?? "")) {
      onUpdate(item.id, { label: labelValue });
    }
  }

  function commitHref() {
    setEditingHref(false);
    if (hrefValue !== (item.href ?? "")) {
      onUpdate(item.id, { href: hrefValue });
    }
  }

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = currentWidth;
      isResizing.current = true;
    },
    [currentWidth]
  );

  function handleResizePointerMove(e: React.PointerEvent) {
    if (!isResizing.current) return;
    const newW = Math.max(60, Math.round(resizeStartWidth.current + (e.clientX - resizeStartX.current)));
    onUpdate(item.id, { width: newW });
  }

  function handleResizePointerUp(e: React.PointerEvent) {
    if (!isResizing.current) return;
    isResizing.current = false;
    const newW = Math.max(60, Math.round(resizeStartWidth.current + (e.clientX - resizeStartX.current)));
    onUpdate(item.id, { width: newW });
  }

  const stopProp = { onPointerDown: (e: React.PointerEvent) => e.stopPropagation() };

  const InlineInput = ({
    value,
    onChange,
    onBlur,
    onKeyDown,
    placeholder,
    bold,
    style,
  }: {
    value: string;
    onChange: (v: string) => void;
    onBlur: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    bold?: boolean;
    style?: React.CSSProperties;
  }) => (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      {...stopProp}
      className="outline-none bg-transparent border-b text-sm w-full"
      style={{ borderColor: "var(--color-border)", fontWeight: bold ? 700 : 400, ...style }}
      placeholder={placeholder}
    />
  );

  const renderContent = () => {
    if (item.type === "divider-v") {
      return (
        <div
          className="h-6 w-px mx-1 flex-shrink-0"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      );
    }

    if (item.type === "title") {
      return editingLabel ? (
        <InlineInput
          value={labelValue}
          onChange={setLabelValue}
          onBlur={commitLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitLabel();
            if (e.key === "Escape") { setEditingLabel(false); setLabelValue(item.label ?? ""); }
          }}
          bold
          placeholder="Project title"
        />
      ) : (
        <span
          className="font-bold text-sm truncate cursor-text select-text flex-1"
          onClick={() => setEditingLabel(true)}
          {...stopProp}
          title="Click to edit"
        >
          {item.label || "Title"}
        </span>
      );
    }

    if (item.type === "search") {
      return (
        <div className="flex items-center gap-1 w-full" {...stopProp}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ flexShrink: 0, color: "#888" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder="Search headers..."
            className="outline-none bg-transparent text-xs flex-1 min-w-0"
            style={{ color: "inherit" }}
          />
        </div>
      );
    }

    if (item.type === "link") {
      return (
        <div className="flex flex-col w-full" {...stopProp}>
          {editingLabel ? (
            <InlineInput
              value={labelValue}
              onChange={setLabelValue}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") { commitLabel(); setEditingHref(true); }
                if (e.key === "Escape") { setEditingLabel(false); setLabelValue(item.label ?? ""); }
              }}
              placeholder="Link label"
            />
          ) : (
            <span
              className="truncate text-xs cursor-text"
              style={{ color: "var(--color-accent)" }}
              onClick={() => setEditingLabel(true)}
              title="Click to edit label"
            >
              {item.label || "Link"}
            </span>
          )}
          {editingHref ? (
            <InlineInput
              value={hrefValue}
              onChange={setHrefValue}
              onBlur={commitHref}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitHref();
                if (e.key === "Escape") { setEditingHref(false); setHrefValue(item.href ?? ""); }
              }}
              placeholder="https://..."
              style={{ color: "#888", fontSize: "11px" }}
            />
          ) : (
            <span
              className="truncate text-xs cursor-text"
              style={{ color: "#aaa", fontSize: "11px" }}
              onClick={() => setEditingHref(true)}
              title="Click to set URL"
            >
              {item.href || "set url →"}
            </span>
          )}
        </div>
      );
    }

    if (item.type === "button") {
      return (
        <div className="flex flex-col w-full" {...stopProp}>
          {editingLabel ? (
            <InlineInput
              value={labelValue}
              onChange={setLabelValue}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
                if (e.key === "Escape") { setEditingLabel(false); setLabelValue(item.label ?? ""); }
              }}
              placeholder="Button label"
            />
          ) : (
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium text-white cursor-text truncate"
              style={{ backgroundColor: "var(--color-accent)" }}
              onClick={() => setEditingLabel(true)}
              title="Click to edit label"
            >
              {item.label || "Button"}
            </span>
          )}
          {editingHref ? (
            <InlineInput
              value={hrefValue}
              onChange={setHrefValue}
              onBlur={commitHref}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitHref();
                if (e.key === "Escape") { setEditingHref(false); setHrefValue(item.href ?? ""); }
              }}
              placeholder="https://..."
              style={{ color: "#888", fontSize: "11px" }}
            />
          ) : (
            <span
              className="truncate cursor-text"
              style={{ color: "#aaa", fontSize: "11px" }}
              onClick={() => setEditingHref(true)}
              title="Click to set URL"
            >
              {item.href || "set url →"}
            </span>
          )}
        </div>
      );
    }

    if (item.type === "badge") {
      return editingLabel ? (
        <InlineInput
          value={labelValue}
          onChange={setLabelValue}
          onBlur={commitLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitLabel();
            if (e.key === "Escape") { setEditingLabel(false); setLabelValue(item.label ?? ""); }
          }}
          placeholder="Badge text"
          {...stopProp}
        />
      ) : (
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs border cursor-text"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-alt)" }}
          onClick={() => setEditingLabel(true)}
          {...stopProp}
          title="Click to edit"
        >
          {item.label || "v1.0.0"}
        </span>
      );
    }

    if (item.type === "github") {
      return (
        <div className="flex items-center gap-1 w-full" {...stopProp}>
          <GithubIcon />
          {editingHref ? (
            <InlineInput
              value={hrefValue}
              onChange={setHrefValue}
              onBlur={commitHref}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitHref();
                if (e.key === "Escape") { setEditingHref(false); setHrefValue(item.href ?? ""); }
              }}
              placeholder="https://github.com/..."
              style={{ fontSize: "11px", color: "#888" }}
            />
          ) : (
            <span
              className="truncate text-xs cursor-text flex-1"
              style={{ color: "#888" }}
              onClick={() => setEditingHref(true)}
              title="Click to set GitHub URL"
            >
              {item.href || "set repo url →"}
            </span>
          )}
        </div>
      );
    }

    if (item.type === "theme-toggle") {
      return (
        <div className="flex items-center gap-1 text-xs" {...stopProp}>
          <span>☀️</span>
          <span style={{ color: "#aaa" }}>/</span>
          <span>🌙</span>
        </div>
      );
    }

    return null;
  };

  if (item.type === "divider-v") {
    return (
      <div
        ref={setNodeRef}
        style={containerStyle}
        {...attributes}
        {...listeners}
        className="flex items-center flex-shrink-0 cursor-grab"
      >
        <div className="h-6 w-px mx-1" style={{ backgroundColor: "var(--color-border)" }} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={containerStyle}
      className="relative flex items-center gap-1 px-2 py-1 rounded-md border text-sm flex-shrink-0 overflow-hidden"
      {...attributes}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-center gap-1 w-full min-w-0" {...listeners} style={{ cursor: "grab" }}>
        {renderContent()}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          className="ml-auto text-gray-300 hover:text-red-400 flex-shrink-0 text-base leading-none"
        >
          ×
        </button>
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 hover:opacity-100 transition-opacity"
        style={{ backgroundColor: "var(--color-accent)" }}
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
      />
    </div>
  );
}

export default function NavbarEditor({ projectId, projectName, initialItems, onSearch }: Props) {
  const [items, setItems] = useState<NavbarItem[]>(initialItems);
  const [showToolbox, setShowToolbox] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const widthSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    const timers = widthSaveTimers.current;
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const idx = items.findIndex((i) => i.id === active.id);
    if (idx < 0) return;
    const item = items[idx];
    const currentX = getItemX(item, idx, items);
    const newX = Math.max(0, currentX + delta.x);
    const currentStyles = parseStyles(item.styles ?? "{}");
    const newStyles = JSON.stringify({ ...currentStyles, x: newX });
    setItems((prev) => prev.map((i) => i.id === active.id ? { ...i, styles: newStyles } : i));
    try {
      await updateNavbarItem(active.id as string, { styles: newStyles });
    } catch {
      toast.error("Failed to save position");
    }
  }

  async function handleAddItem(type: string, label: string) {
    try {
      const newX = computeNextX(items);
      const item = await createNavbarItem(
        projectId,
        type,
        type === "title" ? projectName : label
      );
      const stylesWithX = JSON.stringify({ x: newX });
      await updateNavbarItem(item.id, { styles: stylesWithX });
      setItems((prev) => [...prev, { ...item, styles: stylesWithX }]);
      setShowToolbox(false);
    } catch {
      toast.error("Failed to add item");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNavbarItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedItemId === id) setSelectedItemId(null);
    } catch {
      toast.error("Failed to remove item");
    }
  }

  function handleUpdate(id: string, data: ItemUpdate) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
    if (data.width !== undefined) {
      const safeWidth = Math.max(60, Math.round(data.width));
      if (widthSaveTimers.current[id]) clearTimeout(widthSaveTimers.current[id]);
      widthSaveTimers.current[id] = setTimeout(() => {
        updateNavbarItem(id, { width: safeWidth }).catch(() => toast.error("Failed to save width"));
      }, 220);
      return;
    }
    if (data.label !== undefined || data.href !== undefined) {
      updateNavbarItem(id, data).catch(() => toast.error("Failed to save"));
    }
  }

  function handleStyleChange(id: string, key: keyof ItemStyles, value: string | number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const current = parseStyles(item.styles ?? "{}");
    const next: ItemStyles = { ...current, [key]: value };
    const stylesStr = JSON.stringify(next);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, styles: stylesStr } : i)));
    updateNavbarItem(id, { styles: stylesStr }).catch(() => toast.error("Failed to save styles"));
  }

  const navbarContentWidth = items.reduce((max, item, i) => {
    const x = getItemX(item, i, items);
    const w = item.type === "divider-v" ? 20 : (item.width ?? 120);
    return Math.max(max, x + w + 40);
  }, 300);

  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;
  const selectedStyles = parseStyles(selectedItem?.styles ?? "{}");

  return (
    <div
      className="border-b flex-shrink-0"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-alt)" }}
    >
      <div className="flex items-center gap-2 px-4" style={{ height: "60px" }}>
        <DndContext id="navbar-dnd" sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            className="flex-1 overflow-x-auto h-full"
            style={{ position: "relative" }}
          >
            <div style={{ position: "relative", height: "100%", minWidth: `${navbarContentWidth}px` }}>
              {items.length === 0 && (
                <span
                  className="text-xs"
                  style={{
                    color: "#aaa",
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  Click + Add to build your navbar
                </span>
              )}
              {items.map((item, index) => (
                <DraggableNavItem
                  key={item.id}
                  item={item}
                  itemX={getItemX(item, index, items)}
                  isSelected={selectedItemId === item.id}
                  onSelect={(id) => setSelectedItemId((prev) => (prev === id ? null : id))}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onSearchChange={item.type === "search" ? onSearch : undefined}
                />
              ))}
            </div>
          </div>
        </DndContext>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowToolbox((v) => !v)}
            className="px-3 py-1.5 rounded-md text-xs font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--color-border)" }}
          >
            + Add
          </button>
          {showToolbox && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowToolbox(false)} />
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-lg border shadow-md z-20 py-1"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
              >
                {AVAILABLE_TOOLS.map((tool) => (
                  <button
                    key={tool.type}
                    onClick={() => handleAddItem(tool.type, tool.label)}
                    className="w-full text-left px-3 py-2 text-sm transition-opacity hover:opacity-70"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-alt)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                    }
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedItem && (
        <div
          className="flex items-center gap-4 px-4 py-2 border-t"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
        >
          <span className="text-xs font-medium" style={{ color: "#888" }}>
            Style: {selectedItem.type}
          </span>
          <label className="flex items-center gap-1.5 text-xs">
            Bg
            <input
              type="color"
              value={selectedStyles.bgColor || "#EFE9E3"}
              onChange={(e) => handleStyleChange(selectedItem.id, "bgColor", e.target.value)}
              style={{ width: "20px", height: "20px", border: "none", cursor: "pointer" }}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            Text
            <input
              type="color"
              value={selectedStyles.textColor || "#1a1a1a"}
              onChange={(e) => handleStyleChange(selectedItem.id, "textColor", e.target.value)}
              style={{ width: "20px", height: "20px", border: "none", cursor: "pointer" }}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            Font size
            <input
              type="number"
              value={selectedStyles.fontSize || 13}
              min={10}
              max={24}
              onChange={(e) => handleStyleChange(selectedItem.id, "fontSize", Number(e.target.value))}
              style={{ width: "42px", fontSize: "11px", padding: "1px 4px", border: "1px solid #D9CFC7", borderRadius: "3px" }}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            Padding
            <input
              type="text"
              value={selectedStyles.padding || ""}
              onChange={(e) => handleStyleChange(selectedItem.id, "padding", e.target.value)}
              placeholder="4px 8px"
              style={{ width: "72px", fontSize: "11px", padding: "1px 4px", border: "1px solid #D9CFC7", borderRadius: "3px" }}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            Radius
            <input
              type="number"
              value={selectedStyles.borderRadius || 0}
              min={0}
              max={50}
              onChange={(e) => handleStyleChange(selectedItem.id, "borderRadius", Number(e.target.value))}
              style={{ width: "42px", fontSize: "11px", padding: "1px 4px", border: "1px solid #D9CFC7", borderRadius: "3px" }}
            />
          </label>
          <button
            onClick={() => { handleDelete(selectedItem.id); }}
            className="ml-auto text-xs px-2 py-1 rounded border"
            style={{ color: "#ef4444", borderColor: "#ef4444" }}
          >
            Delete item
          </button>
          <button
            onClick={() => setSelectedItemId(null)}
            className="text-xs"
            style={{ color: "#aaa" }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
