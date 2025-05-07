// (Move or create this helper component and function)

import React from 'react';

// Helper component for dimension items (slightly restyled)
export const DimensionItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center justify-center bg-muted/50 dark:bg-muted/20 p-2.5 rounded-md text-center h-16 border">
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-sm font-semibold mt-1">{value}</p>
  </div>
);

// Dimension formatting function (from old DetailsPanel)
export const formatDimension = (valueInMm: number | null | undefined, unit: 'cm' | 'm'): string => {
  if (valueInMm === null || valueInMm === undefined || valueInMm === 0) return "-";

  let value: number;
  let formattedValue: string;

  if (unit === 'm') {
    value = valueInMm / 1000;
    formattedValue = value.toFixed(3).replace(/\.?0+$/, '');
    if (formattedValue.endsWith('.')) {
      formattedValue = formattedValue.slice(0, -1);
    }
    // Ensure very small numbers are still shown correctly
    if (Number(formattedValue) === 0 && value !== 0) {
      formattedValue = value.toFixed(3);
    }
    return `${formattedValue || '0'} m`;
  } else { // unit === 'cm'
    value = valueInMm / 10;
    formattedValue = value.toFixed(1).replace(/\.0$/, '');
    // Ensure very small numbers are still shown correctly
    if (Number(formattedValue) === 0 && value !== 0) {
      formattedValue = value.toFixed(1);
    }
    return `${formattedValue || '0'} cm`;
  }
};