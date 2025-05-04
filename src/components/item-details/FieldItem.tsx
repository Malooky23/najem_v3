// (Move or create this helper component)
import React from 'react';
import { cn } from "@/lib/utils";

interface FieldItemProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  containerClassName?: string;
}

export const FieldItem: React.FC<FieldItemProps> = ({
  icon: Icon,
  label,
  value,
  iconClassName = "text-muted-foreground",
  valueClassName = "text-sm font-medium truncate",
  containerClassName = cn("flex items-start gap-3", value ?? "hidden") // Use items-start for better alignment if text wraps
}) => (
  <div className={containerClassName}>
    <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", iconClassName)} aria-hidden="true" /> {/* Add mt-0.5 for alignment */}
    <div className="min-w-0 flex-1">
      <p className={valueClassName}>{value || "-"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);