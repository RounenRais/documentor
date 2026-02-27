import { marked } from "marked";
import { parseContent, parseStyles, type Block } from "@/components/editor/BlockEditor/types";

type Header = {
  id: string;
  title: string;
  content: string | null;
};

type NavbarItem = {
  id: string;
  type: string;
  label: string | null;
  href: string | null;
  width: number | null;
  styles?: string | null;
};

function renderBlockToHtml(block: Block): string {
  const d = block.data;
  switch (d.type) {
    case "text": {
      const style = [
        `text-align:${d.align}`,
        `font-size:${d.fontSize}px`,
        d.fontWeight === "bold" ? "font-weight:700" : "",
        d.color ? `color:${d.color}` : "",
        d.bgColor ? `background-color:${d.bgColor}` : "",
        "line-height:1.7",
      ].filter(Boolean).join(";");
      return `<p style="${style}">${d.html || ""}</p>`;
    }
    case "heading": {
      const SIZE = { 1: "2rem", 2: "1.5rem", 3: "1.25rem" };
      const WEIGHT = { 1: 800, 2: 700, 3: 600 };
      const style = [
        `font-size:${SIZE[d.level]}`,
        `font-weight:${WEIGHT[d.level]}`,
        `text-align:${d.align}`,
        d.color ? `color:${d.color}` : "",
        "line-height:1.3",
        "margin:1rem 0 0.5rem",
      ].filter(Boolean).join(";");
      return `<h${d.level} style="${style}">${d.html || ""}</h${d.level}>`;
    }
    case "code": {
      const bg = d.theme === "dark" ? "#1e1e1e" : "#f6f8fa";
      const color = d.theme === "dark" ? "#d4d4d4" : "#1a1a1a";
      const border = d.theme === "dark" ? "#3a3a3a" : "#D9CFC7";
      return `<div style="border-radius:8px;overflow:hidden;border:1px solid ${border};margin:8px 0">
  <div style="padding:6px 12px;background:${bg};border-bottom:1px solid ${border};font-size:11px;color:#888">${d.language}</div>
  <pre style="margin:0;padding:12px 16px;overflow-x:auto;background:${bg};color:${color};font-size:13px;font-family:monospace;line-height:1.6"><code class="language-${d.language}">${d.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
</div>`;
    }
    case "callout": {
      const COLORS = {
        info: { border: "#3b82f6", bg: "#eff6ff" },
        warning: { border: "#f59e0b", bg: "#fffbeb" },
        danger: { border: "#ef4444", bg: "#fef2f2" },
        success: { border: "#22c55e", bg: "#f0fdf4" },
      };
      const c = COLORS[d.variant];
      return `<div style="display:flex;gap:10px;padding:12px 16px;border-radius:8px;border-left:4px solid ${c.border};background-color:${c.bg};margin:8px 0">
  <span style="font-size:18px;flex-shrink:0">${d.icon}</span>
  <div style="flex:1;font-size:14px;line-height:1.6">${d.html || ""}</div>
</div>`;
    }
    case "image": {
      const SIZE_MAP = { sm: "320px", md: "480px", lg: "720px", full: "100%" };
      const justify = d.align === "center" ? "center" : d.align === "right" ? "flex-end" : "flex-start";
      const imgHtml = d.url
        ? `<img src="${d.url}" alt="${d.caption || "image"}" style="max-width:${SIZE_MAP[d.size]};width:100%;border-radius:6px;display:block" />`
        : `<div style="width:${SIZE_MAP[d.size]};height:140px;background:#EFE9E3;border:1px dashed #D9CFC7;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:13px">No image</div>`;
      const captionHtml = d.caption ? `<span style="font-size:12px;color:#888;text-align:center;display:block;margin-top:4px">${d.caption}</span>` : "";
      return `<div style="display:flex;flex-direction:column;align-items:${justify};gap:8px;margin:8px 0">${imgHtml}${captionHtml}</div>`;
    }
    case "table": {
      const rows = d.rows.map((row, ri) => {
        const cells = row.map((cell) => {
          const tag = ri === 0 ? "th" : "td";
          const style = ri === 0 ? "background:#EFE9E3;font-weight:600;" : "";
          return `<${tag} style="border:1px solid #D9CFC7;padding:6px 10px;font-size:13px;${style}">${cell}</${tag}>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("\n");
      return `<div style="overflow-x:auto;margin:8px 0"><table style="border-collapse:collapse;width:100%">${rows}</table></div>`;
    }
    case "divider":
      return `<hr style="border:none;border-top:${d.thickness}px ${d.borderStyle} ${d.borderColor || "#D9CFC7"};margin:12px 0" />`;
    case "button": {
      const SIZE_PAD = { sm: "4px 12px", md: "8px 20px", lg: "12px 28px" };
      const SIZE_FONT = { sm: "12px", md: "14px", lg: "16px" };
      let btnStyle = `display:inline-flex;align-items:center;justify-content:center;padding:${SIZE_PAD[d.size]};font-size:${SIZE_FONT[d.size]};border-radius:${d.borderRadius}px;font-weight:600;text-decoration:none;`;
      if (d.variant === "filled") btnStyle += `background-color:${d.color || "#C9B59C"};color:#fff;border:none;`;
      else if (d.variant === "outlined") btnStyle += `border:2px solid ${d.color || "#C9B59C"};color:${d.color || "#C9B59C"};background:transparent;`;
      else btnStyle += `color:${d.color || "#C9B59C"};background:transparent;border:none;`;
      return `<a href="${d.href || "#"}" target="_blank" rel="noopener noreferrer" style="${btnStyle}">${d.label || "Button"}</a>`;
    }
    case "badge":
      return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:${d.borderRadius}px;background-color:${d.bgColor || "#EFE9E3"};color:${d.textColor || "#1a1a1a"};font-size:12px;font-weight:500">${d.label || "Badge"}</span>`;
    case "quote":
      return `<blockquote style="border-left:4px solid #C9B59C;padding-left:16px;margin:8px 0">
  <div style="font-size:15px;font-style:italic;line-height:1.7;color:#555">${d.html || ""}</div>
  ${d.author ? `<div style="font-size:12px;color:#888;margin-top:6px">— ${d.author}</div>` : ""}
</blockquote>`;
  }
}

function renderBlocksToHtml(content: string | null): string {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.startsWith("[")) {
    try {
      const blocks = parseContent(trimmed);
      return blocks.map(renderBlockToHtml).join("\n");
    } catch {
      /* fall through */
    }
  }
  return marked(trimmed) as string;
}

export function generateHtml(
  projectName: string,
  headers: Header[],
  navbarItems: NavbarItem[]
): string {
  const navbarHtml = navbarItems
    .map((item) => {
      const ps = parseStyles(item.styles ?? "{}");
      const styleExtra = [
        ps.bgColor ? `background-color:${ps.bgColor}` : "",
        ps.textColor ? `color:${ps.textColor}` : "",
        ps.fontSize ? `font-size:${ps.fontSize}px` : "",
        ps.padding ? `padding:${ps.padding}` : "",
        ps.borderRadius ? `border-radius:${ps.borderRadius}px` : "",
      ].filter(Boolean).join(";");

      if (item.type === "title") {
        return `<span style="font-weight:700;font-size:1.1rem;${styleExtra}">${item.label || projectName}</span>`;
      }
      if (item.type === "search") {
        return `<input type="text" placeholder="Search..." style="padding:4px 10px;border-radius:6px;border:1px solid #D9CFC7;background:#F9F8F6;font-size:0.85rem;outline:none;${styleExtra}" />`;
      }
      if (item.type === "link") {
        const href = item.href || "#";
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:#C9B59C;font-size:0.85rem;${styleExtra}">${item.label || "Link"}</a>`;
      }
      if (item.type === "button") {
        const href = item.href || "#";
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;padding:4px 12px;border-radius:6px;background:#C9B59C;color:#fff;font-size:0.8rem;font-weight:600;text-decoration:none;${styleExtra}">${item.label || "Button"}</a>`;
      }
      if (item.type === "badge") {
        return `<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;border:1px solid #D9CFC7;background:#EFE9E3;font-size:0.75rem;${styleExtra}">${item.label || "Badge"}</span>`;
      }
      if (item.type === "divider-v") {
        return `<div style="width:1px;height:20px;background:#D9CFC7;margin:0 4px"></div>`;
      }
      if (item.type === "github") {
        const href = item.href || "#";
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;color:#1a1a1a;${styleExtra}" title="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg></a>`;
      }
      if (item.type === "theme-toggle") {
        return `<button onclick="document.body.classList.toggle('dark')" style="font-size:1rem;background:none;border:none;cursor:pointer;${styleExtra}" title="Toggle theme">🌙</button>`;
      }
      return "";
    })
    .join("\n    ");

  const sidebarLinks = headers
    .map(
      (h) =>
        `<li><a href="#header-${h.id}" style="display:block;padding:8px 12px;text-decoration:none;color:#1a1a1a;border-radius:6px;font-size:0.875rem;transition:background 0.15s" onmouseover="this.style.background='#D9CFC7'" onmouseout="this.style.background='transparent'">${h.title}</a></li>`
    )
    .join("\n        ");

  const contentSections = headers
    .map((h) => {
      const html = renderBlocksToHtml(h.content);
      return `
    <section id="header-${h.id}" style="margin-bottom:3rem">
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #D9CFC7">${h.title}</h2>
      <div class="content">${html}</div>
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #F9F8F6; color: #1a1a1a; min-height: 100vh; display: flex; flex-direction: column; }
    nav { display: flex; align-items: center; gap: 16px; padding: 0 24px; height: 60px; background: #EFE9E3; border-bottom: 1px solid #D9CFC7; position: sticky; top: 0; z-index: 10; }
    .layout { display: flex; flex: 1; }
    aside { width: 240px; min-width: 240px; background: #EFE9E3; border-right: 1px solid #D9CFC7; padding: 16px 8px; position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; }
    aside h3 { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; padding: 0 12px; margin-bottom: 8px; }
    aside ul { list-style: none; }
    main { flex: 1; padding: 40px 48px; max-width: 900px; }
    .content p { line-height: 1.75; margin-bottom: 1rem; }
    .content a { color: #C9B59C; }
    .content ul, .content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    .content li { margin-bottom: 0.25rem; line-height: 1.6; }
  </style>
</head>
<body>
  <nav>
    ${navbarHtml}
  </nav>
  <div class="layout">
    <aside>
      <h3>Contents</h3>
      <ul>
        ${sidebarLinks}
      </ul>
    </aside>
    <main>
      ${contentSections}
    </main>
  </div>
  <script>hljs.highlightAll();</script>
</body>
</html>`;
}
