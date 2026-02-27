"use client";

import { useRef } from "react";
import type { TableBlockData } from "../types";

type Props = {
  data: TableBlockData;
  onChange?: (data: TableBlockData) => void;
  readOnly?: boolean;
};

export default function TableBlock({ data, onChange, readOnly }: Props) {
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);

  function rebuildRows() {
    if (!onChange) return;
    const newRows = cellRefs.current.map((row) =>
      row.map((cell) => cell?.innerText ?? "")
    );
    onChange({ ...data, rows: newRows });
  }

  function addRow() {
    const cols = data.rows[0]?.length ?? 3;
    onChange?.({ ...data, rows: [...data.rows, Array(cols).fill("")] });
  }

  function removeRow(rowIdx: number) {
    if (data.rows.length <= 1) return;
    onChange?.({ ...data, rows: data.rows.filter((_, i) => i !== rowIdx) });
  }

  function addCol() {
    onChange?.({ ...data, rows: data.rows.map((row) => [...row, ""]) });
  }

  function removeCol() {
    if ((data.rows[0]?.length ?? 0) <= 1) return;
    onChange?.({ ...data, rows: data.rows.map((row) => row.slice(0, -1)) });
  }

  const cellStyle: React.CSSProperties = {
    border: "1px solid #D9CFC7",
    padding: "6px 10px",
    fontSize: "13px",
    minWidth: "80px",
    outline: "none",
    verticalAlign: "top",
  };

  if (readOnly) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} style={{ backgroundColor: ri === 0 ? "#EFE9E3" : "transparent" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ ...cellStyle, fontWeight: ri === 0 ? 600 : 400 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  cellRefs.current = data.rows.map((row, ri) =>
    row.map((_, ci) => cellRefs.current[ri]?.[ci] ?? null)
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ backgroundColor: ri === 0 ? "#EFE9E3" : "transparent" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  ref={(el) => {
                    if (!cellRefs.current[ri]) cellRefs.current[ri] = [];
                    cellRefs.current[ri][ci] = el;
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  style={{ ...cellStyle, fontWeight: ri === 0 ? 600 : 400 }}
                  onInput={rebuildRows}
                  onPointerDown={(e) => e.stopPropagation()}
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
              {!readOnly && (
                <td style={{ border: "none", padding: "0 4px", verticalAlign: "middle" }}>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => removeRow(ri)}
                    style={{ fontSize: "11px", color: "#aaa", background: "none", border: "none", cursor: "pointer" }}
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
        {[
          { label: "+ Row", action: addRow },
          { label: "+ Col", action: addCol },
          { label: "- Col", action: removeCol },
        ].map(({ label, action }) => (
          <button
            key={label}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={action}
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              border: "1px solid #D9CFC7",
              borderRadius: "4px",
              background: "transparent",
              cursor: "pointer",
              color: "#666",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
