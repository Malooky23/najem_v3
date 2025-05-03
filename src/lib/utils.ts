import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Helper function to format dimension values (stored in mm)
export const formatDimension = (valueInMm: number | null | undefined, unit: 'cm' | 'm'): string => {
  if (valueInMm === null || valueInMm === undefined || valueInMm === 0) return "-";

  let value: number;
  let formattedValue: string;

  if (unit === 'm') {
    value = valueInMm / 1000;
    // Format to max 3 decimal places, remove trailing zeros if only .000
    formattedValue = value.toFixed(3).replace(/\.?0+$/, '');
    // If it ends up as just an integer after removing zeros, ensure it's displayed as such
    if (formattedValue.endsWith('.')) {
      formattedValue = formattedValue.slice(0, -1);
    }
    return `${formattedValue} m`;
  } else { // unit === 'cm'
    value = valueInMm / 10;
    // Format to max 1 decimal place, remove trailing .0
    formattedValue = value.toFixed(1).replace(/\.0$/, '');
    return `${formattedValue} cm`;
  }
};

