"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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

type Theme = {
  bg: string;
  bgAlt: string;
  border: string;
  accent: string;
  text: string;
};

const LIGHT: Theme = {
  bg: "#F9F8F6",
  bgAlt: "#EFE9E3",
  border: "#D9CFC7",
  accent: "#C9B59C",
  text: "#1a1a1a",
};

const DARK: Theme = {
  bg: "#18171a",
  bgAlt: "#242228",
  border: "#3a3440",
  accent: "#C9B59C",
  text: "#e8e0f0",
};

function computeNumbering(headers: Header[]): Map<string, string> {
  const map = new Map<string, string>();
  const top = headers.filter((h) => h.parentId === null);
  top.forEach((h, i) => {
    const n = String(i + 1);
    map.set(h.id, n);
    headers.filter((c) => c.parentId === h.id).forEach((c, j) => map.set(c.id, `${n}.${j + 1}`));
  });
  return map;
}

function buildDisplayOrder(headers: Header[]): Header[] {
  const top = headers.filter((h) => h.parentId === null);
  const result: Header[] = [];
  for (const h of top) {
    result.push(h);
    result.push(...headers.filter((c) => c.parentId === h.id));
  }
  return result;
}

type Props = {
  project: Project;
  headers: Header[];
  navbarItems: NavbarItem[];
};

export default function DocsClient({ project, headers, navbarItems }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(headers[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("docs-theme");
      if (stored === "dark") setIsDark(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleTheme() {
    setIsDark((v) => {
      const next = !v;
      try {
        localStorage.setItem("docs-theme", next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const t = isDark ? DARK : LIGHT;
  const numbering = computeNumbering(headers);

  const filteredHeaders = searchQuery
    ? (() => {
        const q = searchQuery.toLowerCase();
        const ids = new Set<string>();
        headers.forEach((h) => {
          if (h.title.toLowerCase().includes(q)) {
            ids.add(h.id);
            if (h.parentId) ids.add(h.parentId);
          }
        });
        return headers.filter((h) => ids.has(h.id));
      })()
    : headers;

  const displayOrder = buildDisplayOrder(filteredHeaders);
  const selectedHeader = headers.find((h) => h.id === selectedId) ?? null;

  function renderNavItem(item: NavbarItem) {
    const w = item.width ?? 120;
    const baseStyle: React.CSSProperties = { minWidth: w, maxWidth: w };

    if (item.type === "divider-v") {
      return (
        <div key={item.id} className="h-5 w-px mx-1" style={{ backgroundColor: t.border }} />
      );
    }
    if (item.type === "title") {
      return (
        <span key={item.id} className="font-bold text-sm" style={{ ...baseStyle }}>
          {item.label || project.name}
        </span>
      );
    }
    if (item.type === "search") {
      return (
        <div key={item.id} className="flex items-center gap-1" style={{ ...baseStyle }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="outline-none bg-transparent text-xs flex-1"
            style={{ color: t.text }}
          />
        </div>
      );
    }
    if (item.type === "link") {
      return (
        <a
          key={item.id}
          href={item.href || "#"}
          target={item.href ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="text-xs"
          style={{ color: t.accent, ...baseStyle }}
        >
          {item.label || "Link"}
        </a>
      );
    }
    if (item.type === "button") {
      return (
        <a
          key={item.id}
          href={item.href || "#"}
          target={item.href ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-medium text-white"
          style={{ backgroundColor: t.accent, ...baseStyle }}
        >
          {item.label || "Button"}
        </a>
      );
    }
    if (item.type === "badge") {
      return (
        <span
          key={item.id}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border"
          style={{ borderColor: t.border, backgroundColor: t.bgAlt }}
        >
          {item.label || "Badge"}
        </span>
      );
    }
    if (item.type === "github") {
      return (
        <a
          key={item.id}
          href={item.href || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs"
          style={{ color: t.text }}
          title="GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      );
    }
    if (item.type === "theme-toggle") {
      return (
        <button
          key={item.id}
          onClick={toggleTheme}
          className="text-base leading-none transition-opacity hover:opacity-70"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      );
    }
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: t.bg, color: t.text, minWidth: "1280px" }}
    >
      <nav
        className="flex items-center gap-3 px-6 border-b sticky top-0 z-10"
        style={{ height: "60px", backgroundColor: t.bgAlt, borderColor: t.border }}
      >
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {navbarItems.length === 0 && (
            <span className="font-bold text-sm">{project.name}</span>
          )}
          {navbarItems.map((item) => renderNavItem(item))}
        </div>
        {!navbarItems.some((i) => i.type === "theme-toggle") && (
          <button
            onClick={toggleTheme}
            className="text-base leading-none transition-opacity hover:opacity-70 flex-shrink-0"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        )}
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="flex flex-col border-r sticky top-[60px] overflow-y-auto"
          style={{
            width: "240px",
            minWidth: "240px",
            backgroundColor: t.bgAlt,
            borderColor: t.border,
            height: "calc(100vh - 60px)",
          }}
        >
          <div
            className="px-4 py-3 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: t.border, color: "#888" }}
          >
            Contents
          </div>
          {displayOrder.map((header) => {
            const number = numbering.get(header.id) ?? "";
            const isChild = header.parentId !== null;
            const isSelected = selectedId === header.id;
            return (
              <button
                key={header.id}
                onClick={() => setSelectedId(header.id)}
                className="flex items-center gap-1.5 text-sm text-left py-2.5 border-b w-full transition-opacity hover:opacity-70"
                style={{
                  paddingLeft: isChild ? "28px" : "16px",
                  paddingRight: "12px",
                  borderColor: t.border,
                  backgroundColor: isSelected ? t.border : "transparent",
                  fontWeight: isSelected ? 600 : 400,
                  color: t.text,
                }}
              >
                {isChild && (
                  <span style={{ color: t.border, fontSize: "10px" }}>└</span>
                )}
                <span className="text-xs font-mono flex-shrink-0" style={{ color: t.accent }}>
                  {number}
                </span>
                <span className="truncate">{header.title}</span>
              </button>
            );
          })}
        </aside>

        <main
          className="flex-1 overflow-y-auto p-10 prose prose-sm max-w-none"
          style={{ backgroundColor: t.bg, color: t.text }}
        >
          {selectedHeader ? (
            <>
              <h1
                className="text-2xl font-bold mb-6 pb-3 border-b"
                style={{ borderColor: t.border }}
              >
                {numbering.get(selectedHeader.id)} {selectedHeader.title}
              </h1>
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
                          backgroundColor: t.bgAlt,
                          border: `1px solid ${t.border}`,
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {selectedHeader.content || "*No content yet.*"}
              </ReactMarkdown>
            </>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: "#888" }}>
              <p>Select a section from the sidebar</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
