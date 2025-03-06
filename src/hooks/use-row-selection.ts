import { useState, useCallback } from 'react';
import { RowSelectionState, Updater } from '@tanstack/react-table';

export function useRowSelection(
  initialState: RowSelectionState = {},
  onChange?: (newSelection: RowSelectionState) => void
) {
  const [rowSelection, setInternalRowSelection] = useState<RowSelectionState>(initialState);

  const setRowSelection = useCallback((updater: Updater<RowSelectionState>) => {
    // Handle both function updaters and direct values
    if (typeof updater === 'function') {
      setInternalRowSelection(old => {
        const newValue = (updater as Function)(old);
        if (onChange) onChange(newValue);
        return newValue;
      });
    } else {
      setInternalRowSelection(updater);
      if (onChange) onChange(updater);
    }
  }, [onChange]);

  return [rowSelection, setRowSelection] as const;
}
