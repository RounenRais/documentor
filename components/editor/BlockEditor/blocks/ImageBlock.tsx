"use client";

import { useState } from "react";
import type { ImageBlockData } from "../types";

type Props = {
  data: ImageBlockData;
  onChange?: (data: ImageBlockData) => void;
  readOnly?: boolean;
};

const SIZE_MAP = { sm: "320px", md: "480px", lg: "720px", full: "100%" };

export default function ImageBlock({ data, onChange, readOnly }: Props) {
  const [imgError, setImgError] = useState(false);

  const wrapStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: data.align === "center" ? "center" : data.align === "right" ? "flex-end" : "flex-start",
    gap: "8px",
  };

  const imgWidth = SIZE_MAP[data.size];

  if (readOnly) {
    return (
      <div style={wrapStyle}>
        {data.url && !imgError ? (
          <img
            src={data.url}
            alt={data.caption || "image"}
            onError={() => setImgError(true)}
            style={{ maxWidth: imgWidth, width: "100%", borderRadius: "6px", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: imgWidth,
              height: "160px",
              backgroundColor: "#EFE9E3",
              border: "1px dashed #D9CFC7",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              fontSize: "13px",
            }}
          >
            {data.url ? "Image failed to load" : "No image URL"}
          </div>
        )}
        {data.caption && (
          <span style={{ fontSize: "12px", color: "#888", textAlign: "center" }}>{data.caption}</span>
        )}
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <input
        type="text"
        value={data.url}
        onChange={(e) => { setImgError(false); onChange?.({ ...data, url: e.target.value }); }}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Paste image URL here..."
        style={{
          width: "100%",
          padding: "6px 10px",
          fontSize: "12px",
          border: "1px solid #D9CFC7",
          borderRadius: "6px",
          outline: "none",
          backgroundColor: "#F9F8F6",
        }}
      />
      {data.url && !imgError ? (
        <img
          src={data.url}
          alt={data.caption || "image"}
          onError={() => setImgError(true)}
          style={{ maxWidth: imgWidth, width: "100%", borderRadius: "6px", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: imgWidth,
            height: "140px",
            backgroundColor: "#EFE9E3",
            border: "1px dashed #D9CFC7",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
            fontSize: "13px",
          }}
        >
          {data.url && imgError ? "Image failed to load" : "Enter a URL above"}
        </div>
      )}
      <input
        type="text"
        value={data.caption}
        onChange={(e) => onChange?.({ ...data, caption: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Caption (optional)"
        style={{
          padding: "4px 8px",
          fontSize: "12px",
          border: "1px solid #D9CFC7",
          borderRadius: "6px",
          outline: "none",
          backgroundColor: "#F9F8F6",
          color: "#888",
          textAlign: "center",
        }}
      />
    </div>
  );
}
