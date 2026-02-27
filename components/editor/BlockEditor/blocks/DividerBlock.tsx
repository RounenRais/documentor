"use client";

import type { DividerBlockData } from "../types";

type Props = {
  data: DividerBlockData;
  readOnly?: boolean;
};

export default function DividerBlock({ data }: Props) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `${data.thickness}px ${data.borderStyle} ${data.borderColor || "#D9CFC7"}`,
        margin: "8px 0",
      }}
    />
  );
}
