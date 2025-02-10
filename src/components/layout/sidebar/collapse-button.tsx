import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export function CollapseButton({ isCollapsed, onClick }: CollapseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  );
} 