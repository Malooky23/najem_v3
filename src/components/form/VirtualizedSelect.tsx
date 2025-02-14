"use client";
import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface Option {
  value: string;
  label: string;
}

interface VirtualizedSelectProps {
  options: Option[];
  value: string;
  onChange: (newValue: string) => void;
  height?: number;    // Visible height of dropdown
  itemSize?: number;  // Height of each option
}

export function VirtualizedSelect({
  options,
  value,
  onChange,
  height = 200,
  itemSize = 35,
}: VirtualizedSelectProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{ height, overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px" }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const option = options[virtualRow.index];
          return (
            <div
              key={option.value}
              onClick={() => onChange(option.value)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                backgroundColor: option.value === value ? "#eee" : "#fff",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
} 