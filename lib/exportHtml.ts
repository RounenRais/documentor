import { marked } from "marked";

type Header = {
  id: string;
  title: string;
  content: string | null;
};

type NavbarItem = {
  id: string;
  type: string;
  label: string | null;
};

export function generateHtml(
  projectName: string,
  headers: Header[],
  navbarItems: NavbarItem[]
): string {
  const navbarHtml = navbarItems
    .map((item) => {
      if (item.type === "title") {
        return `<span style="font-weight:700;font-size:1.1rem">${item.label || projectName}</span>`;
      }
      if (item.type === "search") {
        return `<input type="text" placeholder="Search..." style="padding:4px 10px;border-radius:6px;border:1px solid #D9CFC7;background:#F9F8F6;font-size:0.85rem;outline:none" />`;
      }
      if (item.type === "link") {
        return `<a href="#" style="text-decoration:none;color:#1a1a1a;font-size:0.9rem">${item.label || "Link"}</a>`;
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
      const html = marked(h.content || "");
      return `
    <section id="header-${h.id}" style="margin-bottom:3rem">
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #D9CFC7">${h.title}</h2>
      <div class="prose">${html}</div>
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
    .prose h1, .prose h2, .prose h3, .prose h4 { font-weight: 700; margin: 1.5rem 0 0.75rem; }
    .prose h1 { font-size: 2rem; }
    .prose h2 { font-size: 1.5rem; }
    .prose h3 { font-size: 1.25rem; }
    .prose p { line-height: 1.75; margin-bottom: 1rem; }
    .prose ul, .prose ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    .prose li { margin-bottom: 0.25rem; line-height: 1.6; }
    .prose pre { background: #f4f4f4; border-radius: 6px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
    .prose code:not(pre code) { background: #EFE9E3; border: 1px solid #D9CFC7; border-radius: 4px; padding: 2px 6px; font-size: 0.85em; font-family: monospace; }
    .prose blockquote { border-left: 4px solid #C9B59C; padding-left: 1rem; color: #666; margin-bottom: 1rem; }
    .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    .prose th, .prose td { padding: 8px 12px; border: 1px solid #D9CFC7; text-align: left; }
    .prose th { background: #EFE9E3; font-weight: 600; }
    .prose a { color: #C9B59C; }
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
