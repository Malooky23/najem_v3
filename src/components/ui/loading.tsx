import { cn } from "@/lib/utils";

export default function Loading({
  className,
  fullScreen = false,
}: {
  className?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "fixed inset-0 bg-background/60 backdrop-blur-sm",
        className
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
