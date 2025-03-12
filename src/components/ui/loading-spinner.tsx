import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  fullScreen?: boolean;
  color?: string; // Add a color prop
}

export function LoadingSpinner({
  className,
  fullScreen = false,
  color = "primary", // Default to 'primary' if no color is provided
}: LoadingSpinnerProps) {
  const borderColorClass = color ? `border-${color}` : "border-primary"; // Construct the border color class

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "fixed inset-0 bg-background/60 backdrop-blur-sm",
        className
      )}
    >
      <div
        className={cn(
          "h-8 w-8 animate-spin rounded-full border-4",
          borderColorClass, // Apply the dynamic border color class
          "border-t-transparent"
        )}
      />
    </div>
  );
}