export type TextBlockData = {
  type: "text";
  html: string;
  align: "left" | "center" | "right";
  fontSize: number;
  fontWeight: "normal" | "bold";
  color: string;
  bgColor: string;
};

export type HeadingBlockData = {
  type: "heading";
  html: string;
  level: 1 | 2 | 3;
  align: "left" | "center" | "right";
  color: string;
};

export type CodeBlockData = {
  type: "code";
  code: string;
  language: string;
  theme: "dark" | "light";
  lineNumbers: boolean;
};

export type CalloutBlockData = {
  type: "callout";
  variant: "info" | "warning" | "danger" | "success";
  icon: string;
  html: string;
};

export type ImageBlockData = {
  type: "image";
  url: string;
  caption: string;
  size: "sm" | "md" | "lg" | "full";
  align: "left" | "center" | "right";
};

export type TableBlockData = {
  type: "table";
  rows: string[][];
};

export type DividerBlockData = {
  type: "divider";
  borderStyle: "solid" | "dashed" | "dotted";
  borderColor: string;
  thickness: 1 | 2 | 4;
};

export type ButtonBlockData = {
  type: "button";
  label: string;
  href: string;
  variant: "filled" | "outlined" | "ghost";
  size: "sm" | "md" | "lg";
  color: string;
  borderRadius: number;
};

export type BadgeBlockData = {
  type: "badge";
  label: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
};

export type QuoteBlockData = {
  type: "quote";
  html: string;
  author: string;
};

export type BlockData =
  | TextBlockData
  | HeadingBlockData
  | CodeBlockData
  | CalloutBlockData
  | ImageBlockData
  | TableBlockData
  | DividerBlockData
  | ButtonBlockData
  | BadgeBlockData
  | QuoteBlockData;

export type BlockType = BlockData["type"];

export type Block = {
  id: string;
  width?: "full" | "1/2" | "1/3" | "2/3";
  data: BlockData;
};

export function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  switch (type) {
    case "text":
      return { id, data: { type: "text", html: "", align: "left", fontSize: 14, fontWeight: "normal", color: "", bgColor: "" } };
    case "heading":
      return { id, data: { type: "heading", html: "", level: 2, align: "left", color: "" } };
    case "code":
      return { id, data: { type: "code", code: "", language: "typescript", theme: "light", lineNumbers: false } };
    case "callout":
      return { id, data: { type: "callout", variant: "info", icon: "ℹ️", html: "" } };
    case "image":
      return { id, data: { type: "image", url: "", caption: "", size: "md", align: "center" } };
    case "table":
      return { id, data: { type: "table", rows: [["", "", ""], ["", "", ""]] } };
    case "divider":
      return { id, data: { type: "divider", borderStyle: "solid", borderColor: "#D9CFC7", thickness: 1 } };
    case "button":
      return { id, data: { type: "button", label: "Button", href: "#", variant: "filled", size: "md", color: "#C9B59C", borderRadius: 6 } };
    case "badge":
      return { id, data: { type: "badge", label: "Badge", bgColor: "#EFE9E3", textColor: "#1a1a1a", borderRadius: 9999 } };
    case "quote":
      return { id, data: { type: "quote", html: "", author: "" } };
  }
}

export function parseContent(raw: string | null): Block[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as Block[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through */
    }
  }
  if (!trimmed) return [];
  const id = crypto.randomUUID();
  return [{ id, data: { type: "text", html: trimmed.replace(/\n/g, "<br>"), align: "left", fontSize: 14, fontWeight: "normal", color: "", bgColor: "" } }];
}

export type ItemStyles = {
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: string;
  borderRadius?: number;
  x?: number;
};

export function parseStyles(raw: string | null): ItemStyles {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ItemStyles;
  } catch {
    return {};
  }
}
