"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import NavbarEditor from "./NavbarEditor";
import HeaderPanel from "./HeaderPanel";
import ContentEditor from "./ContentEditor";
import { generateHtml } from "@/lib/exportHtml";

type Header = {
  id: string;
  title: string;
  content: string | null;
  order: number;
  parentId: string | null;
};

type NavbarItem = {
  id: string;
  type: string;
  label: string | null;
  href: string | null;
  width: number | null;
  order: number;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type ColorScheme = {
  bg: string;
  bgAlt: string;
  border: string;
  accent: string;
};

const DEFAULT_COLORS: ColorScheme = {
  bg: "#F9F8F6",
  bgAlt: "#EFE9E3",
  border: "#D9CFC7",
  accent: "#C9B59C",
};

const LS_KEY = "docColorScheme";

function applyColors(c: ColorScheme) {
  const r = document.documentElement;
  r.style.setProperty("--color-bg", c.bg);
  r.style.setProperty("--color-bg-alt", c.bgAlt);
  r.style.setProperty("--color-border", c.border);
  r.style.setProperty("--color-accent", c.accent);
}

type Props = {
  project: Project;
  initialHeaders: Header[];
  initialNavbarItems: NavbarItem[];
};

export default function EditorClient({ project, initialHeaders, initialNavbarItems }: Props) {
  const [headers, setHeaders] = useState<Header[]>(initialHeaders);
  const [selectedHeaderId, setSelectedHeaderId] = useState<string | null>(
    initialHeaders[0]?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [colors, setColors] = useState<ColorScheme>(DEFAULT_COLORS);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed: ColorScheme = JSON.parse(stored);
        setColors(parsed);
        applyColors(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function handleColorChange(key: keyof ColorScheme, value: string) {
    const next = { ...colors, [key]: value };
    setColors(next);
    applyColors(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }, 300);
  }

  function handleResetColors() {
    setColors(DEFAULT_COLORS);
    applyColors(DEFAULT_COLORS);
    localStorage.removeItem(LS_KEY);
  }

  const selectedHeader = headers.find((h) => h.id === selectedHeaderId) ?? null;

  function handleHeadersChange(newHeaders: Header[]) {
    setHeaders(newHeaders);
  }

  function handleContentChange(id: string, content: string) {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, content } : h)));
  }

  function handleExportHtml() {
    try {
      const html = generateHtml(project.name, headers, initialNavbarItems);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("HTML exported");
    } catch {
      toast.error("Failed to export");
    }
  }

  const COLOR_LABELS: { key: keyof ColorScheme; label: string }[] = [
    { key: "bg", label: "Background" },
    { key: "bgAlt", label: "Panel Background" },
    { key: "border", label: "Border" },
    { key: "accent", label: "Accent" },
  ];

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <header
        className="flex items-center justify-between px-4 border-b flex-shrink-0"
        style={{
          height: "50px",
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg-alt)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "#888" }}>
            ← Dashboard
          </Link>
          <span style={{ color: "var(--color-border)" }}>/</span>
          <span className="text-sm font-semibold">{project.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowColorPanel((v) => !v)}
              className="px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="inline-block w-3 h-3 rounded-full border"
                style={{ backgroundColor: colors.accent, borderColor: "var(--color-border)" }}
              />
              Colors
            </button>
            {showColorPanel && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowColorPanel(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1 z-40 rounded-xl border shadow-xl p-4"
                  style={{
                    width: "220px",
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <p className="text-xs font-semibold mb-3">Color Theme</p>
                  <div className="flex flex-col gap-3">
                    {COLOR_LABELS.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs">{label}</span>
                        <input
                          type="color"
                          value={colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border"
                          style={{ borderColor: "var(--color-border)" }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleResetColors}
                    className="w-full mt-4 py-1.5 text-xs rounded-md border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    Reset to default
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExportHtml}
            className="px-4 py-1.5 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Convert to HTML
          </button>
        </div>
      </header>

      <NavbarEditor
        projectId={project.id}
        projectName={project.name}
        initialItems={initialNavbarItems}
        onSearch={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <HeaderPanel
          projectId={project.id}
          headers={headers}
          onHeadersChange={handleHeadersChange}
          selectedId={selectedHeaderId}
          onSelect={setSelectedHeaderId}
          searchQuery={searchQuery}
        />

        <ContentEditor
          key={selectedHeaderId ?? "none"}
          header={
            selectedHeader
              ? {
                  id: selectedHeader.id,
                  title: selectedHeader.title,
                  content: selectedHeader.content,
                }
              : null
          }
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
}
