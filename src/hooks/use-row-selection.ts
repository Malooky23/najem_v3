import { useCallback, useRef, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";

/**
 * A custom hook to manage row selection state with optimized updates
 * @param initialState Initial row selection state
 * @param onChange Callback to run when selection changes
 * @returns [rowSelection, setRowSelection]
 */
export function useRowSelection(
  initialState: RowSelectionState = {}, 
  onChange?: (selection: RowSelectionState) => void
): [RowSelectionState, (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void] {
  const [rowSelection, setLocalRowSelection] = useState<RowSelectionState>(initialState);
  const lastChangeRef = useRef<number>(0);
  
  // Wrapped setter that calls onChange only when needed
  const setRowSelection = useCallback((updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
    setLocalRowSelection((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      
      // Only trigger onChange if the selection actually changed
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        // Throttle to prevent rapid succession of callbacks
        const now = Date.now();
        if (now - lastChangeRef.current > 20) { // 20ms throttle
          lastChangeRef.current = now;
          onChange?.(next);
        }
      }
      
      return next;
    });
  }, [onChange]);

  return [rowSelection, setRowSelection];
}
